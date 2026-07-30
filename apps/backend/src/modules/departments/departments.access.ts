import { and, eq, inArray } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import { departmentClosure, departments } from '@/db/schema.js'

export async function departmentExists(
  app: FastifyInstance,
  departmentId: number,
): Promise<boolean> {
  const [row] = await app.db
    .select({ id: departments.id })
    .from(departments)
    .where(and(eq(departments.id, departmentId), eq(departments.isDeleted, false)))
    .limit(1)
  return Boolean(row)
}

export async function enabledDepartmentIds(
  app: FastifyInstance,
  candidateIds: number[],
): Promise<number[]> {
  if (candidateIds.length === 0) {
    return []
  }
  const rows = await app.db
    .select({ id: departments.id })
    .from(departments)
    .where(
      and(
        inArray(departments.id, candidateIds),
        eq(departments.enabled, true),
        eq(departments.isDeleted, false),
      ),
    )
  return rows.map((row) => row.id)
}

export async function ancestorDepartmentIds(
  app: FastifyInstance,
  departmentIds: number[],
): Promise<number[]> {
  if (departmentIds.length === 0) {
    return []
  }
  const rows = await app.db
    .select({ id: departmentClosure.ancestorId })
    .from(departmentClosure)
    .where(
      and(
        inArray(departmentClosure.descendantId, departmentIds),
        eq(departmentClosure.isDeleted, false),
      ),
    )
  return [...new Set(rows.map((row) => row.id))]
}

export async function descendantDepartmentIds(
  app: FastifyInstance,
  departmentIds: number[],
): Promise<number[]> {
  if (departmentIds.length === 0) {
    return []
  }
  const rows = await app.db
    .select({ id: departmentClosure.descendantId })
    .from(departmentClosure)
    .innerJoin(
      departments,
      and(
        eq(departmentClosure.descendantId, departments.id),
        eq(departments.enabled, true),
        eq(departments.isDeleted, false),
      ),
    )
    .where(
      and(
        inArray(departmentClosure.ancestorId, departmentIds),
        eq(departmentClosure.isDeleted, false),
      ),
    )
  return [...new Set(rows.map((row) => row.id))]
}
