import { z } from 'zod'
import {
  apiResponseSchema,
  ErrorResponseSchema,
} from '../../shared/http.js'

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

export const CurrentUserResponseSchema = apiResponseSchema(CurrentUserSchema)
export const LoginResultSchema = z.union([
  CurrentUserResponseSchema,
  ErrorResponseSchema,
])

export type LoginRequest = z.infer<typeof LoginRequestSchema>
export type CurrentUser = z.infer<typeof CurrentUserSchema>
export type CurrentUserResponse = z.infer<typeof CurrentUserResponseSchema>
export type LoginResult = z.infer<typeof LoginResultSchema>
