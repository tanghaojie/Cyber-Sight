import { describe, expect, it } from 'vitest'
import { ErrorCode } from '@/shared/errors/error-codes.js'
import {
  failure,
  normalizePagination,
  paginatedFailure,
  paginatedSuccess,
  success,
} from '@/shared/http/response.js'

// 锁定成功/失败外壳、分页空失败结构和直接函数调用时的分页参数保护。
describe('HTTP response helpers', () => {
  it('creates a successful response', () => {
    expect(success({ id: 1 })).toEqual({
      status: ErrorCode.SUCCESS,
      data: { id: 1 },
    })
  })

  it('rejects zero as a failure code', () => {
    expect(() => failure(ErrorCode.SUCCESS, 'invalid')).toThrow(
      'Failure responses must use a non-zero error code',
    )
  })

  it('creates a paginated success response', () => {
    expect(paginatedSuccess([{ id: 1 }], 20)).toEqual({
      status: ErrorCode.SUCCESS,
      list: [{ id: 1 }],
      total: 20,
    })
  })

  it('creates a paginated failure response with an empty result set', () => {
    expect(paginatedFailure(ErrorCode.INVALID_REQUEST, 'Invalid pagination')).toEqual({
      status: ErrorCode.INVALID_REQUEST,
      list: [],
      total: 0,
      err: 'Invalid pagination',
    })
  })

  it('applies pagination defaults', () => {
    expect(normalizePagination()).toEqual({
      pageNum: 1,
      pageSize: 10,
    })
    expect(normalizePagination({ pageNum: 2, pageSize: 25 })).toEqual({
      pageNum: 2,
      pageSize: 25,
    })
  })

  it('rejects invalid pagination values', () => {
    expect(() => normalizePagination({ pageNum: 0 })).toThrow('pageNum must be a positive integer')
    expect(() => normalizePagination({ pageSize: 1.5 })).toThrow(
      'pageSize must be a positive integer',
    )
  })
})
