export type {
  $defs,
  components,
  operations,
  paths,
  webhooks,
} from './schema.js'

export interface ApiResponse<T = unknown> {
  status: number
  data?: T
  err?: string
}

export interface PaginationRequest {
  pageNum?: number
  pageSize?: number
}

export interface PaginatedResponse<T = unknown> {
  status: number
  list: T[]
  total: number
  err?: string
}
