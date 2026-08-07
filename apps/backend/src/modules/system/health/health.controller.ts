import { Controller, Get } from '@nestjs/common'
import { HealthResponseSchema, type HealthResponse } from '@scaffold/api-contract'
import { Public } from '@/modules/system/authorization/authorization.guard.js'
import { ContractRoute } from '@/shared/http/contract.js'
import { success } from '@/shared/http/response.js'

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
