import { and, count, eq, inArray } from 'drizzle-orm'
import type { PositionRequest } from '@scaffold/api-contract'
import type { Database } from '@/db/index.js'
import { departments, positions, userPositions } from '@/db/schema.js'
import type { BackendRuntime } from '@/shared/runtime/backend-runtime.js'
import { enabledDepartmentIds } from '@/modules/system/departments/departments.access.js'
import {
  createPosition as insertPosition,
  listPositionOptions,
  listPositions,
  softDeletePosition,
  updatePosition,
} from './positions.repository.js'

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

export { listPositions, listPositionOptions }

export async function canUseDepartment(
  app: BackendRuntime,
  departmentId: number,
): Promise<boolean> {
  const ids = await enabledDepartmentIds(app, [departmentId])
  return ids.includes(departmentId)
}

export async function positionExists(app: BackendRuntime, id: number): Promise<boolean> {
  const [row] = await app.db
    .select({ id: positions.id })
    .from(positions)
    .where(and(eq(positions.id, id), eq(positions.isDeleted, false)))
    .limit(1)
  return Boolean(row)
}

export async function canChangePositionDepartment(
  app: BackendRuntime,
  id: number,
  departmentId: number,
): Promise<boolean> {
  const [position] = await app.db
    .select({ departmentId: positions.departmentId })
    .from(positions)
    .where(and(eq(positions.id, id), eq(positions.isDeleted, false)))
    .limit(1)
  if (!position || position.departmentId === departmentId) {
    return Boolean(position)
  }
  const [assignment] = await app.db
    .select({ value: count() })
    .from(userPositions)
    .where(and(eq(userPositions.positionId, id), eq(userPositions.isDeleted, false)))
  return assignment.value === 0
}

export async function hasActivePositionAssignments(
  app: BackendRuntime,
  id: number,
): Promise<boolean> {
  const [assignment] = await app.db
    .select({ value: count() })
    .from(userPositions)
    .where(and(eq(userPositions.positionId, id), eq(userPositions.isDeleted, false)))
  return assignment.value > 0
}

export async function createPosition(
  app: BackendRuntime,
  input: PositionRequest,
  actorId: number,
): Promise<number> {
  return insertPosition(app, input, actorId)
}

export { updatePosition, softDeletePosition }

export async function replaceUserPositionsInTransaction(
  tx: PositionTransaction,
  userId: number,
  positionIds: number[],
  departmentIds: number[],
  actorId: number,
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

export async function softDeleteUserPositionsInTransaction(
  tx: PositionTransaction,
  userId: number,
  actorId: number,
): Promise<void> {
  await tx
    .update(userPositions)
    .set({ isDeleted: true, updatedAt: new Date(), updatedBy: actorId })
    .where(and(eq(userPositions.userId, userId), eq(userPositions.isDeleted, false)))
}
