import type { FastifyInstance } from 'fastify'
import type { ListQuery } from '@scaffold/api-contract'
import { ErrorCode } from '@/shared/errors/error-codes.js'
import { failure, normalizePagination, success } from './response.js'

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
  if (!updated) {
    throw app.httpErrors.notFound('Resource not found')
  }
}
