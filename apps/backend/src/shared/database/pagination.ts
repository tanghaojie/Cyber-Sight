export interface RepositoryListQuery {
  pageNum: number
  pageSize: number
  keyword?: string
}

/** 把一页的 1-based 页码转换为数据库查询使用的 0-based 偏移量。 */
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
  // 数据库使用 Date，HTTP 契约统一传输带时区的 ISO 字符串。
  return {
    isDeleted: row.isDeleted,
    createdAt: row.createdAt.toISOString(),
    createdBy: row.createdBy,
    updatedAt: row.updatedAt.toISOString(),
    updatedBy: row.updatedBy,
  }
}
