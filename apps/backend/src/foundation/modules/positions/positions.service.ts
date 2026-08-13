import { Inject, Injectable } from '@nestjs/common'
import { and, count, eq, inArray } from 'drizzle-orm'
import type { EntityId, PositionRequest } from '@cyber-ai-forge/api-contract'
import type { Database } from '@/foundation/database/index.js'
import { departments, positions, userPositions } from '@/foundation/database/schema.js'
import { DATABASE } from '@/foundation/shared/database/database.provider.js'
import { DepartmentsAccess } from '@/foundation/modules/departments/departments.access.js'
import { PositionsRepository, type PositionListQuery } from './positions.repository.js'

export type PositionTransaction = Parameters<Parameters<Database['transaction']>[0]>[0]

export class InvalidPositionAssignmentError extends Error {
  constructor() {
    super('Invalid position assignment')
    this.name = 'InvalidPositionAssignmentError'
  }
}

export function isInvalidPositionAssignment(
  error: unknown,
): error is InvalidPositionAssignmentError {
  return error instanceof InvalidPositionAssignmentError
}

@Injectable()
export class PositionsService {
  constructor(
    @Inject(DATABASE) private readonly db: Database,
    @Inject(DepartmentsAccess)
    private readonly departments: DepartmentsAccess,
    @Inject(PositionsRepository)
    private readonly repository: PositionsRepository,
  ) {}

  async listPositions(query: PositionListQuery) {
    return this.repository.listPositions(query)
  }

  async listPositionOptions(departmentIds?: EntityId[]) {
    return this.repository.listPositionOptions(departmentIds)
  }

  async canUseDepartment(departmentId: EntityId): Promise<boolean> {
    const ids = await this.departments.enabledDepartmentIds([departmentId])
    return ids.includes(departmentId)
  }

  async positionExists(id: EntityId): Promise<boolean> {
    const [row] = await this.db
      .select({ id: positions.id })
      .from(positions)
      .where(and(eq(positions.id, id), eq(positions.isDeleted, false)))
      .limit(1)
    return Boolean(row)
  }

  async canChangePositionDepartment(id: EntityId, departmentId: EntityId): Promise<boolean> {
    const [position] = await this.db
      .select({ departmentId: positions.departmentId })
      .from(positions)
      .where(and(eq(positions.id, id), eq(positions.isDeleted, false)))
      .limit(1)
    if (!position || position.departmentId === departmentId) {
      return Boolean(position)
    }
    const [assignment] = await this.db
      .select({ value: count() })
      .from(userPositions)
      .where(and(eq(userPositions.positionId, id), eq(userPositions.isDeleted, false)))
      .limit(1)
    return assignment.value === 0
  }

  async hasActivePositionAssignments(id: EntityId): Promise<boolean> {
    const [assignment] = await this.db
      .select({ value: count() })
      .from(userPositions)
      .where(and(eq(userPositions.positionId, id), eq(userPositions.isDeleted, false)))
      .limit(1)
    return (assignment?.value ?? 0) > 0
  }

  async createPosition(input: PositionRequest, actorId: EntityId): Promise<EntityId> {
    return this.repository.createPosition(input, actorId)
  }

  async updatePosition(id: EntityId, input: PositionRequest, actorId: EntityId): Promise<boolean> {
    return this.repository.updatePosition(id, input, actorId)
  }

  async softDeletePosition(id: EntityId, actorId: EntityId): Promise<boolean> {
    return this.repository.softDeletePosition(id, actorId)
  }

  async replaceUserPositionsInTransaction(
    tx: PositionTransaction,
    userId: EntityId,
    positionIds: EntityId[],
    departmentIds: EntityId[],
    actorId: EntityId,
  ): Promise<void> {
    const uniquePositionIds = [...new Set(positionIds)]
    if (uniquePositionIds.length !== positionIds.length) {
      throw new InvalidPositionAssignmentError()
    }
    if (uniquePositionIds.length > 0) {
      const validRows = await tx
        .select({ id: positions.id, departmentId: positions.departmentId })
        .from(positions)
        .innerJoin(departments, eq(positions.departmentId, departments.id))
        .where(
          and(
            inArray(positions.id, uniquePositionIds),
            eq(positions.enabled, true),
            eq(positions.isDeleted, false),
            eq(departments.enabled, true),
            eq(departments.isDeleted, false),
          ),
        )
      const departmentSet = new Set(departmentIds)
      if (
        validRows.length !== uniquePositionIds.length ||
        validRows.some((row) => !departmentSet.has(row.departmentId))
      ) {
        throw new InvalidPositionAssignmentError()
      }
    }
    const now = new Date()
    await tx
      .update(userPositions)
      .set({ isDeleted: true, updatedAt: now, updatedBy: actorId })
      .where(and(eq(userPositions.userId, userId), eq(userPositions.isDeleted, false)))
    for (const positionId of uniquePositionIds) {
      const [existing] = await tx
        .select({ id: userPositions.id })
        .from(userPositions)
        .where(and(eq(userPositions.userId, userId), eq(userPositions.positionId, positionId)))
        .limit(1)
      if (existing) {
        await tx
          .update(userPositions)
          .set({ isDeleted: false, updatedAt: now, updatedBy: actorId })
          .where(eq(userPositions.id, existing.id))
      } else {
        await tx.insert(userPositions).values({
          userId,
          positionId,
          createdBy: actorId,
          updatedBy: actorId,
        })
      }
    }
  }

  async softDeleteUserPositionsInTransaction(
    tx: PositionTransaction,
    userId: EntityId,
    actorId: EntityId,
  ): Promise<void> {
    await tx
      .update(userPositions)
      .set({ isDeleted: true, updatedAt: new Date(), updatedBy: actorId })
      .where(and(eq(userPositions.userId, userId), eq(userPositions.isDeleted, false)))
  }
}
