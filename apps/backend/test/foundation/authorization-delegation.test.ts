import { describe, expect, it, vi } from 'vitest'
import type {
  AuthorizationSubjectType,
  CurrentUser,
  EntityId,
  SubjectAccessRequest,
  UserUpdate,
} from '@cyber-ai-forge/api-contract'
import { AuthorizationController } from '@/foundation/modules/authorization/authorization.controller.js'
import { AuthorizationService } from '@/foundation/modules/authorization/authorization.service.js'
import { UsersController } from '@/foundation/modules/users/users.controller.js'
import { ErrorCode } from '@/foundation/shared/errors/error-codes.js'

const emptyAccess: SubjectAccessRequest = { permissionKeys: [], dataPolicies: [] }
const actorId = '0198f31a-0000-7000-8000-000000000007'
const managerRoleId = '0198f31a-0000-7000-8000-000000000002'
const higherRoleId = '0198f31a-0000-7000-8000-000000000003'
const actorDepartmentId = '0198f31a-0000-7000-8000-000000000010'
const otherDepartmentId = '0198f31a-0000-7000-8000-000000000020'
const targetUserId = '0198f31a-0000-7000-8000-000000000099'
const actor: CurrentUser = {
  id: actorId,
  username: 'limited-manager',
  displayName: 'Limited Manager',
  roles: [{ id: managerRoleId, name: 'Manager' }],
}

function createService() {
  const departments = {
    enabledDepartmentIds: vi.fn(async (ids: EntityId[]) => [...new Set(ids)]),
    ancestorDepartmentIds: vi.fn(async (ids: EntityId[]) => [...new Set(ids)]),
    descendantDepartmentIds: vi.fn(async (ids: EntityId[]) => [...new Set(ids)]),
  }
  const roles = {
    enabledRoleIds: vi.fn(async (ids: EntityId[]) => [...new Set(ids)]),
  }
  const users = {
    assignedRoleIds: vi.fn(async (_userId: EntityId) => [] as EntityId[]),
    assignedDepartmentIds: vi.fn(async (userId: EntityId) =>
      userId === actorId ? [actorDepartmentId] : [otherDepartmentId],
    ),
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
    ownerUserIds: [actorId],
    departmentIds: [actorDepartmentId],
  })
  vi.spyOn(service, 'getSubjectAccess').mockImplementation(
    async (_subjectType: AuthorizationSubjectType, _subjectId: EntityId) => emptyAccess,
  )
  return { service, departments, roles, users }
}

describe('bounded authorization delegation', () => {
  it('hides a user authorization subject outside the actor read range', async () => {
    const { service } = createService()

    await expect(service.canAccessSubject(actorId, 'user', targetUserId, 'read')).resolves.toBe(
      false,
    )
  })

  it('rejects granting all when the actor has a restricted users plan', async () => {
    const { service } = createService()

    await expect(
      service.canDelegateSubjectAccess(actorId, 'user', actorId, {
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
      service.canDelegateSubjectAccess(actorId, 'user', actorId, {
        permissionKeys: [],
        dataPolicies: [
          {
            resourceKey: 'users',
            action: 'read',
            scopeType: 'custom_departments',
            inheritToChildren: false,
            departmentIds: [actorDepartmentId],
            includeDescendants: false,
          },
        ],
      }),
    ).resolves.toBe(true)
  })

  it('rejects assigning a role with a permission the actor does not have', async () => {
    const { service } = createService()
    vi.mocked(service.getSubjectAccess).mockImplementation(
      async (subjectType: AuthorizationSubjectType, subjectId: EntityId) =>
        subjectType === 'role' && subjectId === higherRoleId
          ? { permissionKeys: ['roles.manage'], dataPolicies: [] }
          : emptyAccess,
    )

    await expect(
      service.canManageUserAuthorizationContext(actorId, null, [higherRoleId], [actorDepartmentId]),
    ).resolves.toBe(false)
  })

  it('preserves a legitimate user assignment contained by the actor authority', async () => {
    const { service } = createService()
    vi.mocked(service.getSubjectAccess).mockImplementation(
      async (subjectType: AuthorizationSubjectType, subjectId: EntityId) =>
        subjectType === 'role' && subjectId === managerRoleId
          ? { permissionKeys: ['users.manage'], dataPolicies: [] }
          : emptyAccess,
    )

    await expect(
      service.canManageUserAuthorizationContext(
        actorId,
        null,
        [managerRoleId],
        [actorDepartmentId],
      ),
    ).resolves.toBe(true)
  })

  it('does not allow replacing away an existing role above the actor authority', async () => {
    const { service, users } = createService()
    users.assignedRoleIds.mockResolvedValue([higherRoleId])
    users.assignedDepartmentIds.mockResolvedValue([actorDepartmentId])
    vi.mocked(service.getSubjectAccess).mockImplementation(
      async (subjectType: AuthorizationSubjectType, subjectId: EntityId) =>
        subjectType === 'role' && subjectId === higherRoleId
          ? { permissionKeys: ['roles.manage'], dataPolicies: [] }
          : emptyAccess,
    )

    await expect(
      service.canManageUserAuthorizationContext(actorId, targetUserId, [], [actorDepartmentId]),
    ).resolves.toBe(false)
  })

  it('rejects a reusable dynamic role policy that cannot be bounded to one target', async () => {
    const { service } = createService()

    await expect(
      service.canDelegateSubjectAccess(actorId, 'role', managerRoleId, {
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
      service.canDelegateSubjectAccess(actorId, 'user', actorId, {
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

    await expect(controller.getUser({ id: targetUserId }, actor)).rejects.toMatchObject({
      status: 404,
    })
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
    roleIds: [higherRoleId],
    positionIds: [],
    departmentIds: [actorDepartmentId],
    primaryDepartmentId: actorDepartmentId,
  }

  function createController() {
    const access = {
      unrestricted: false,
      ownerUserIds: [targetUserId],
      departmentIds: [actorDepartmentId],
    }
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

    await expect(controller.update({ id: targetUserId }, update, actor)).rejects.toMatchObject({
      status: 404,
    })
    expect(authorization.canManageUserAuthorizationContext).not.toHaveBeenCalled()
    expect(repository.updateUser).not.toHaveBeenCalled()
  })

  it('stops a higher-authority role assignment before the user transaction', async () => {
    const { controller, repository, authorization } = createController()
    authorization.canManageUserAuthorizationContext.mockResolvedValue(false)

    await expect(controller.update({ id: targetUserId }, update, actor)).resolves.toEqual({
      status: ErrorCode.FORBIDDEN,
      err: 'Authorization delegation exceeds current access',
    })
    expect(repository.updateUser).not.toHaveBeenCalled()
  })
})
