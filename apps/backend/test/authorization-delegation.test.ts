import { describe, expect, it, vi } from 'vitest'
import type {
  AuthorizationSubjectType,
  CurrentUser,
  SubjectAccessRequest,
  UserUpdate,
} from '@cyber-ai-forge/api-contract'
import { AuthorizationController } from '@/modules/system/authorization/authorization.controller.js'
import { AuthorizationService } from '@/modules/system/authorization/authorization.service.js'
import { UsersController } from '@/modules/system/users/users.controller.js'
import { ErrorCode } from '@/shared/errors/error-codes.js'

const emptyAccess: SubjectAccessRequest = { permissionKeys: [], dataPolicies: [] }
const actor: CurrentUser = {
  id: 7,
  username: 'limited-manager',
  displayName: 'Limited Manager',
  roles: [{ id: 2, name: 'Manager' }],
}

function createService() {
  const departments = {
    enabledDepartmentIds: vi.fn(async (ids: number[]) => [...new Set(ids)]),
    ancestorDepartmentIds: vi.fn(async (ids: number[]) => [...new Set(ids)]),
    descendantDepartmentIds: vi.fn(async (ids: number[]) => [...new Set(ids)]),
  }
  const roles = {
    enabledRoleIds: vi.fn(async (ids: number[]) => [...new Set(ids)]),
  }
  const users = {
    assignedRoleIds: vi.fn(async (_userId: number) => [] as number[]),
    assignedDepartmentIds: vi.fn(async (userId: number) => (userId === 7 ? [10] : [20])),
  }
  const service = new AuthorizationService(
    {} as never,
    departments as never,
    roles as never,
    users as never,
  )
  vi.spyOn(service, 'effectivePermissionKeys').mockResolvedValue(['users.manage'])
  vi.spyOn(service, 'resolveDataAccess').mockResolvedValue({
    unrestricted: false,
    ownerUserIds: [7],
    departmentIds: [10],
  })
  vi.spyOn(service, 'getSubjectAccess').mockImplementation(
    async (_subjectType: AuthorizationSubjectType, _subjectId: number) => emptyAccess,
  )
  return { service, departments, roles, users }
}

describe('bounded authorization delegation', () => {
  it('hides a user authorization subject outside the actor read range', async () => {
    const { service } = createService()

    await expect(service.canAccessSubject(7, 'user', 99, 'read')).resolves.toBe(false)
  })

  it('rejects granting all when the actor has a restricted users plan', async () => {
    const { service } = createService()

    await expect(
      service.canDelegateSubjectAccess(7, 'user', 7, {
        permissionKeys: [],
        dataPolicies: [
          {
            resourceKey: 'users',
            action: 'read',
            scopeType: 'all',
            inheritToChildren: false,
            departmentIds: [],
            includeDescendants: false,
          },
        ],
      }),
    ).resolves.toBe(false)
  })

  it('allows a custom department policy contained by the actor range', async () => {
    const { service } = createService()

    await expect(
      service.canDelegateSubjectAccess(7, 'user', 7, {
        permissionKeys: [],
        dataPolicies: [
          {
            resourceKey: 'users',
            action: 'read',
            scopeType: 'custom_departments',
            inheritToChildren: false,
            departmentIds: [10],
            includeDescendants: false,
          },
        ],
      }),
    ).resolves.toBe(true)
  })

  it('rejects assigning a role with a permission the actor does not have', async () => {
    const { service } = createService()
    vi.mocked(service.getSubjectAccess).mockImplementation(
      async (subjectType: AuthorizationSubjectType, subjectId: number) =>
        subjectType === 'role' && subjectId === 3
          ? { permissionKeys: ['roles.manage'], dataPolicies: [] }
          : emptyAccess,
    )

    await expect(service.canManageUserAuthorizationContext(7, null, [3], [10])).resolves.toBe(false)
  })

  it('preserves a legitimate user assignment contained by the actor authority', async () => {
    const { service } = createService()
    vi.mocked(service.getSubjectAccess).mockImplementation(
      async (subjectType: AuthorizationSubjectType, subjectId: number) =>
        subjectType === 'role' && subjectId === 2
          ? { permissionKeys: ['users.manage'], dataPolicies: [] }
          : emptyAccess,
    )

    await expect(service.canManageUserAuthorizationContext(7, null, [2], [10])).resolves.toBe(true)
  })

  it('does not allow replacing away an existing role above the actor authority', async () => {
    const { service, users } = createService()
    users.assignedRoleIds.mockResolvedValue([3])
    users.assignedDepartmentIds.mockResolvedValue([10])
    vi.mocked(service.getSubjectAccess).mockImplementation(
      async (subjectType: AuthorizationSubjectType, subjectId: number) =>
        subjectType === 'role' && subjectId === 3
          ? { permissionKeys: ['roles.manage'], dataPolicies: [] }
          : emptyAccess,
    )

    await expect(service.canManageUserAuthorizationContext(7, 99, [], [10])).resolves.toBe(false)
  })

  it('rejects a reusable dynamic role policy that cannot be bounded to one target', async () => {
    const { service } = createService()

    await expect(
      service.canDelegateSubjectAccess(7, 'role', 2, {
        permissionKeys: ['users.manage'],
        dataPolicies: [
          {
            resourceKey: 'users',
            action: 'read',
            scopeType: 'own_department',
            inheritToChildren: false,
            departmentIds: [],
            includeDescendants: false,
          },
        ],
      }),
    ).resolves.toBe(false)
  })

  it('allows an unrestricted actor to delegate all', async () => {
    const { service } = createService()
    vi.mocked(service.resolveDataAccess).mockResolvedValue({
      unrestricted: true,
      ownerUserIds: [],
      departmentIds: [],
    })

    await expect(
      service.canDelegateSubjectAccess(7, 'user', 7, {
        permissionKeys: [],
        dataPolicies: [
          {
            resourceKey: 'users',
            action: 'read',
            scopeType: 'all',
            inheritToChildren: false,
            departmentIds: [],
            includeDescendants: false,
          },
        ],
      }),
    ).resolves.toBe(true)
  })
})

describe('authorization subject HTTP boundary', () => {
  function createController() {
    const authorization = {
      authorizationSubjectExists: vi.fn().mockResolvedValue(true),
      getSubjectAccess: vi.fn().mockResolvedValue(emptyAccess),
      replaceSubjectAccess: vi.fn().mockResolvedValue(true),
    }
    const provider = {
      canAccessSubject: vi.fn().mockResolvedValue(true),
      canDelegateSubjectAccess: vi.fn().mockResolvedValue(true),
    }
    const authService = {
      invalidateUserTokenCache: vi.fn(),
      invalidateAllTokenCache: vi.fn(),
    }
    const controller = new AuthorizationController(
      authorization as never,
      provider as never,
      authService as never,
    )
    return { controller, authorization, provider }
  }

  it('does not expose an out-of-scope user authorization configuration', async () => {
    const { controller, provider } = createController()
    provider.canAccessSubject.mockResolvedValue(false)

    await expect(controller.getUser({ id: 99 }, actor)).rejects.toMatchObject({ status: 404 })
  })

  it('stops a self-all payload before the authorization transaction', async () => {
    const { controller, authorization, provider } = createController()
    provider.canDelegateSubjectAccess.mockResolvedValue(false)
    const escalation: SubjectAccessRequest = {
      permissionKeys: [],
      dataPolicies: [
        {
          resourceKey: 'users',
          action: 'read',
          scopeType: 'all',
          inheritToChildren: false,
          departmentIds: [],
          includeDescendants: false,
        },
      ],
    }

    await expect(controller.putUser({ id: actor.id }, escalation, actor)).resolves.toEqual({
      status: ErrorCode.FORBIDDEN,
      err: 'Authorization delegation exceeds current access',
    })
    expect(authorization.replaceSubjectAccess).not.toHaveBeenCalled()
  })

  it('preserves a legitimate bounded replacement', async () => {
    const { controller, authorization } = createController()

    await expect(controller.putUser({ id: actor.id }, emptyAccess, actor)).resolves.toEqual({
      status: 0,
      data: { id: actor.id },
    })
    expect(authorization.replaceSubjectAccess).toHaveBeenCalledWith(
      'user',
      actor.id,
      emptyAccess,
      actor.id,
    )
  })
})

describe('user assignment HTTP boundary', () => {
  const update: UserUpdate = {
    displayName: 'Target User',
    email: 'target@example.com',
    enabled: true,
    roleIds: [3],
    positionIds: [],
    departmentIds: [10],
    primaryDepartmentId: 10,
  }

  function createController() {
    const access = { unrestricted: false, ownerUserIds: [99], departmentIds: [10] }
    const repository = {
      userExistsWithinAccess: vi.fn().mockResolvedValue(true),
      hasValidAssignments: vi.fn().mockResolvedValue(true),
      canAssignUserDepartments: vi.fn().mockResolvedValue(true),
      updateUser: vi.fn().mockResolvedValue(true),
    }
    const authService = { invalidateUserTokenCache: vi.fn() }
    const authorization = {
      resolveDataAccess: vi.fn().mockResolvedValue(access),
      canManageUserAuthorizationContext: vi.fn().mockResolvedValue(true),
    }
    const controller = new UsersController(
      repository as never,
      authService as never,
      authorization as never,
    )
    return { controller, repository, authorization }
  }

  it('hides an update target outside the actor data range', async () => {
    const { controller, repository, authorization } = createController()
    repository.userExistsWithinAccess.mockResolvedValue(false)

    await expect(controller.update({ id: 99 }, update, actor)).rejects.toMatchObject({
      status: 404,
    })
    expect(authorization.canManageUserAuthorizationContext).not.toHaveBeenCalled()
    expect(repository.updateUser).not.toHaveBeenCalled()
  })

  it('stops a higher-authority role assignment before the user transaction', async () => {
    const { controller, repository, authorization } = createController()
    authorization.canManageUserAuthorizationContext.mockResolvedValue(false)

    await expect(controller.update({ id: 99 }, update, actor)).resolves.toEqual({
      status: ErrorCode.FORBIDDEN,
      err: 'Authorization delegation exceeds current access',
    })
    expect(repository.updateUser).not.toHaveBeenCalled()
  })
})
