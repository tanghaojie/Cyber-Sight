import { describe, expect, it } from 'vitest'
import {
  hashSessionToken,
  hashPassword,
  verifyPassword,
} from '../src/modules/auth/auth.security.js'

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
