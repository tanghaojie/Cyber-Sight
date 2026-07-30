import { describe, expect, it } from 'vitest'
import {
  hashSessionToken,
  hashPassword,
  verifyPassword,
} from '@/modules/system/auth/auth.security.js'

// 保护密码不落明文、哈希格式可验证，以及持久会话只保存稳定不可逆摘要。
describe('authentication security helpers', () => {
  it('hashes and verifies a password without storing the password', async () => {
    const password = 'StrongPassword!123'
    const hash = await hashPassword(password)

    expect(hash).not.toContain(password)
    await expect(verifyPassword(password, hash)).resolves.toBe(true)
    await expect(verifyPassword('wrong-password', hash)).resolves.toBe(false)
  })

  it('creates stable one-way hashes for persisted JWT sessions', () => {
    const token = 'header.payload.signature'

    expect(hashSessionToken(token)).toHaveLength(64)
    expect(hashSessionToken(token)).toBe(hashSessionToken(token))
    expect(hashSessionToken(token)).not.toBe(hashSessionToken(`${token}x`))
  })
})
