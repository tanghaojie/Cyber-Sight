import type { FastifyInstance } from 'fastify'
import type { ListQuery } from '@scaffold/api-contract'
import { ErrorCode } from '@/shared/errors/error-codes.js'
import { failure, normalizePagination, success } from './response.js'

/** PostgreSQL 唯一约束冲突的 SQLSTATE，统一转换为资源冲突业务错误。 */
export function isUniqueViolation(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === '23505'
}

export function normalizedListQuery(query: ListQuery) {
  return { ...normalizePagination(query), keyword: query.keyword }
}

export async function mutationResult(operation: () => Promise<number>) {
  try {
    return success({ id: await operation() })
  } catch (error) {
    if (isUniqueViolation(error)) {
      return failure(ErrorCode.RESOURCE_CONFLICT, 'Resource already exists')
    }
    throw error
  }
}

export function ensureUpdated(app: FastifyInstance, updated: boolean): void {
  // 仓储用 false 同时表达“不存在”和“不在数据权限范围内”，对外统一隐藏为 404。
  if (!updated) {
    throw app.httpErrors.notFound('Resource not found')
  }
}
