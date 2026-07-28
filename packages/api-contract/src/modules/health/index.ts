import { z } from 'zod'
import { apiResponseSchema } from '@/shared/http.js'

export const HealthDataSchema = z.strictObject({
  status: z.literal('ok'),
  timestamp: z.iso.datetime(),
})

export const HealthResponseSchema = apiResponseSchema(HealthDataSchema)

export type HealthData = z.infer<typeof HealthDataSchema>
export type HealthResponse = z.infer<typeof HealthResponseSchema>
