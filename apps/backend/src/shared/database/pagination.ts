export interface RepositoryListQuery {
  pageNum: number
  pageSize: number
  keyword?: string
}

export function pageOffset(query: RepositoryListQuery): number {
  return (query.pageNum - 1) * query.pageSize
}

export function auditView(row: {
  isDeleted: boolean
  createdAt: Date
  createdBy: number
  updatedAt: Date
  updatedBy: number
}) {
  return {
    isDeleted: row.isDeleted,
    createdAt: row.createdAt.toISOString(),
    createdBy: row.createdBy,
    updatedAt: row.updatedAt.toISOString(),
    updatedBy: row.updatedBy,
  }
}
