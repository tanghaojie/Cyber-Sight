import { describe, expect, it } from 'vitest'
import {
  createSessionToken,
  hashPassword,
  hashSessionToken,
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

  it('creates opaque session tokens and stable one-way hashes', () => {
    const first = createSessionToken()
    const second = createSessionToken()

    expect(first).not.toBe(second)
    expect(hashSessionToken(first)).toHaveLength(64)
    expect(hashSessionToken(first)).toBe(hashSessionToken(first))
    expect(hashSessionToken(first)).not.toBe(hashSessionToken(second))
  })
})
