import { describe, expect, it, vi } from 'vitest'
import { PasswordUpdateSchema, PersonalProfileUpdateSchema } from '@cyber-ai-forge/api-contract'
import { UsersRepository } from '@/foundation/modules/users/users.repository.js'
import { hashPassword } from '@/foundation/modules/auth/auth.security.js'

const aliceId = '0198f31a-0000-7000-8000-000000000004'

function selectResult<T>(rows: T[]) {
  return {
    from: vi.fn(() => ({
      where: vi.fn(() => ({ limit: vi.fn().mockResolvedValue(rows) })),
    })),
  }
}

function repository(db: unknown): UsersRepository {
  return new UsersRepository(db as never, {} as never, {} as never, {} as never, {} as never)
}

// 个人资料的输入边界必须与管理端用户编辑隔离，拒绝角色、部门和账号状态字段。
describe('personal profile contracts', () => {
  it('accepts only editable profile fields and password credentials', () => {
    expect(
      PersonalProfileUpdateSchema.safeParse({
        displayName: 'Alice',
        email: 'alice@example.com',
      }).success,
    ).toBe(true)
    expect(
      PersonalProfileUpdateSchema.safeParse({
        displayName: 'Alice',
        email: 'alice@example.com',
        enabled: false,
      }).success,
    ).toBe(false)
    expect(
      PasswordUpdateSchema.safeParse({
        currentPassword: 'OldPassword!123',
        newPassword: 'NewPassword!123',
      }).success,
    ).toBe(true)
  })
})

describe('personal profile repository', () => {
  it('loads only the self-service profile projection', async () => {
    const profile = {
      id: aliceId,
      username: 'alice',
      displayName: 'Alice',
      email: 'alice@example.com',
    }
    const users = repository({ select: vi.fn(() => selectResult([profile])) })

    await expect(users.personalProfileForUser(profile.id)).resolves.toEqual(profile)
  })

  it('updates profile fields with the current user as audit actor', async () => {
    const profile = {
      id: aliceId,
      username: 'alice',
      displayName: 'Alice Updated',
      email: 'alice.updated@example.com',
    }
    const returning = vi.fn().mockResolvedValue([profile])
    const set = vi.fn(() => ({ where: vi.fn(() => ({ returning })) }))
    const users = repository({ update: vi.fn(() => ({ set })) })

    await expect(
      users.updatePersonalProfile(profile.id, {
        displayName: profile.displayName,
        email: profile.email,
      }),
    ).resolves.toEqual(profile)
    expect(set).toHaveBeenCalledWith(
      expect.objectContaining({
        displayName: profile.displayName,
        email: profile.email,
        updatedBy: profile.id,
      }),
    )
  })

  it('rejects an incorrect current password without writing a new hash', async () => {
    const passwordHash = await hashPassword('Correct!123')
    const db = {
      select: vi.fn(() => selectResult([{ passwordHash }])),
      update: vi.fn(),
    }
    const users = repository(db)

    await expect(
      users.changePersonalPassword(aliceId, {
        currentPassword: 'Incorrect!123',
        newPassword: 'NewPassword!123',
      }),
    ).resolves.toBe('invalid-current-password')
    expect(db.update).not.toHaveBeenCalled()
  })

  it('hashes and persists a verified new password', async () => {
    const oldPassword = 'Correct!123'
    const passwordHash = await hashPassword(oldPassword)
    const returning = vi.fn().mockResolvedValue([{ id: aliceId }])
    const db = {
      select: vi.fn(() => selectResult([{ passwordHash }])),
      update: vi.fn(() => ({ set: vi.fn(() => ({ where: vi.fn(() => ({ returning })) })) })),
    }
    const users = repository(db)

    await expect(
      users.changePersonalPassword(aliceId, {
        currentPassword: oldPassword,
        newPassword: 'NewPassword!123',
      }),
    ).resolves.toBe('updated')
    expect(db.update).toHaveBeenCalledOnce()
  })
})
