import { Controller, Get } from '@nestjs/common'
import { HealthResponseSchema, type HealthResponse } from '@cyber-ai-forge/api-contract'
import { Public } from '@/foundation/modules/authorization/authorization.guard.js'
import { ContractRoute } from '@/foundation/shared/http/contract.js'
import { success } from '@/foundation/shared/http/response.js'

@Controller()
export class HealthController {
  @Get('/health')
  @Public()
  @ContractRoute({
    operationId: 'getHealth',
    tags: ['Health'],
    summary: 'Health check',
    response: HealthResponseSchema,
    public: true,
  })
  getHealth(): HealthResponse {
    return success({ status: 'ok', timestamp: new Date().toISOString() })
  }
}
