import { Inject, Injectable } from '@nestjs/common'
import { and, eq } from 'drizzle-orm'
import type { Database } from '@/db/index.js'
import { dataPolicyDepartments, permissions } from '@/db/schema.js'
import { DATABASE } from '@/shared/database/database.provider.js'

// 面向其他模块公开最小引用查询，避免菜单或部门模块穿透授权内部表结构。
@Injectable()
export class AuthorizationReferences {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async activePermissionKeyExists(permissionKey: string): Promise<boolean> {
    const [row] = await this.db
      .select({ key: permissions.key })
      .from(permissions)
      .where(
        and(
          eq(permissions.key, permissionKey),
          eq(permissions.enabled, true),
          eq(permissions.isDeleted, false),
        ),
      )
      .limit(1)
    return Boolean(row)
  }

  async hasActiveDepartmentPolicyReference(departmentId: number): Promise<boolean> {
    const [row] = await this.db
      .select({ id: dataPolicyDepartments.id })
      .from(dataPolicyDepartments)
      .where(
        and(
          eq(dataPolicyDepartments.departmentId, departmentId),
          eq(dataPolicyDepartments.isDeleted, false),
        ),
      )
      .limit(1)
    return Boolean(row)
  }
}
