import { z } from 'zod'
import { apiResponseSchema, ErrorResponseSchema } from '@/shared/http.js'

/** 认证模块契约：登录签发令牌，并以同一用户结构返回当前会话身份。 */
export const LoginRequestSchema = z.strictObject({
  username: z.string().min(2).max(50),
  password: z.string().min(8).max(128),
})

export const CurrentUserSchema = z.strictObject({
  id: z.number().int(),
  username: z.string(),
  displayName: z.string(),
  roles: z.array(z.string()),
})

export const LoginDataSchema = z.strictObject({
  user: CurrentUserSchema,
  // 令牌和过期时间成对返回，前端据此决定持久化时限和会话恢复行为。
  issued: z.strictObject({
    token: z.string().min(1),
    expiresAt: z.iso.datetime(),
  }),
})

export const CurrentUserResponseSchema = apiResponseSchema(CurrentUserSchema)
export const LoginSuccessResponseSchema = apiResponseSchema(LoginDataSchema)
export const LoginResultSchema = z.union([LoginSuccessResponseSchema, ErrorResponseSchema])

export type LoginRequest = z.infer<typeof LoginRequestSchema>
export type CurrentUser = z.infer<typeof CurrentUserSchema>
export type LoginData = z.infer<typeof LoginDataSchema>
export type CurrentUserResponse = z.infer<typeof CurrentUserResponseSchema>
export type LoginSuccessResponse = z.infer<typeof LoginSuccessResponseSchema>
export type LoginResult = z.infer<typeof LoginResultSchema>
