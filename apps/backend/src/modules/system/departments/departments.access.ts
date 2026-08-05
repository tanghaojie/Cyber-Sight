import { and, eq, inArray } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import { departmentClosure, departments } from '@/db/schema.js'

// 授权和用户模块通过这些只读函数消费部门状态与闭包关系，不直接拼接部门内部查询。
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
  // 闭包表包含 depth=0 自身路径，因此结果既含输入部门本身，也含全部祖先。
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
    // 后代展开同时连接部门表，确保结果只包含当前有效部门。
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
