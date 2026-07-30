import { createHash, randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'

const scrypt = promisify(scryptCallback)
const KEY_LENGTH = 64

/** 每个密码使用独立随机盐，并把算法标识一起编码，便于后续识别和迁移。 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex')
  const derived = (await scrypt(password, salt, KEY_LENGTH)) as Buffer
  return `scrypt:${salt}:${derived.toString('hex')}`
}

export async function verifyPassword(password: string, encoded: string): Promise<boolean> {
  const [algorithm, salt, expectedHex] = encoded.split(':')
  if (algorithm !== 'scrypt' || !salt || !expectedHex) {
    return false
  }

  const expected = Buffer.from(expectedHex, 'hex')
  if (expected.length !== KEY_LENGTH) {
    return false
  }

  const actual = (await scrypt(password, salt, KEY_LENGTH)) as Buffer
  // 固定长度后使用恒定时间比较，避免普通字符串比较泄露前缀匹配时间。
  return timingSafeEqual(actual, expected)
}

/** 数据库仅保存不可逆摘要，即使会话表泄露也不能直接获得 Bearer Token。 */
export function hashSessionToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}
