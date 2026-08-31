import { Controller, Get, Query } from '@nestjs/common'
import {
  GeoOpenSkyStatesQuerySchema,
  GeoOpenSkyStatesResultSchema,
  type GeoOpenSkyStatesQuery,
  type GeoOpenSkyStatesResult,
} from '@cyber-ai-forge/api-contract'
import { Authenticated } from '@/foundation/modules/authorization/authorization.guard.js'
import { ErrorCode } from '@/foundation/shared/errors/error-codes.js'
import { ContractRoute } from '@/foundation/shared/http/contract.js'
import { success } from '@/foundation/shared/http/response.js'
import { ZodValidationPipe } from '@/foundation/shared/http/zod-validation.pipe.js'
import { GeoService } from './geo.service.js'

@Controller()
export class GeoController {
  constructor(private readonly service: GeoService) {}

  @Get('/platform/geo/open-sky/states')
  @Authenticated()
  @ContractRoute({
    operationId: 'getGeoOpenSkyStates',
    tags: ['Geo'],
    summary: 'Get current OpenSky aircraft states for a map viewport',
    response: GeoOpenSkyStatesResultSchema,
  })
  async getOpenSkyStates(
    @Query(new ZodValidationPipe(GeoOpenSkyStatesQuerySchema)) query: GeoOpenSkyStatesQuery,
  ): Promise<GeoOpenSkyStatesResult> {
    try {
      return success(await this.service.getOpenSkyStates(query))
    } catch {
      return {
        status: ErrorCode.EXTERNAL_DEPENDENCY_ERROR,
        err: 'OpenSky live data is temporarily unavailable',
      }
    }
  }
}
