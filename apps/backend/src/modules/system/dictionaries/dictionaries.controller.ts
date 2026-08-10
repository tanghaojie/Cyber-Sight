import { Body, Controller, Delete, Get, Inject, Param, Post, Put, Query } from '@nestjs/common'
import {
  DictionaryPageResultSchema,
  DictionaryRequestSchema,
  EmptyResultSchema,
  IdParamsSchema,
  ListQuerySchema,
  MutationResultSchema,
  type CurrentUser,
  type DictionaryRequest,
  type IdParams,
  type ListQuery,
} from '@cyber-ai-forge/api-contract'
import {
  CurrentAccessUser,
  RequirePermissions,
} from '@/modules/system/authorization/authorization.guard.js'
import { authorizationPermissionKeys } from '@/modules/system/authorization/authorization.resources.js'
import { ContractRoute } from '@/shared/http/contract.js'
import { ensureUpdated, mutationResult, normalizedListQuery } from '@/shared/http/route-helpers.js'
import { paginatedSuccess, success } from '@/shared/http/response.js'
import { ZodValidationPipe } from '@/shared/http/zod-validation.pipe.js'
import { DictionariesRepository } from './dictionaries.repository.js'

@Controller()
export class DictionariesController {
  constructor(
    @Inject(DictionariesRepository) private readonly repository: DictionariesRepository,
  ) {}

  @Get('/admin/dictionaries')
  @RequirePermissions(authorizationPermissionKeys.dictionariesManage)
  @ContractRoute({
    operationId: 'listDictionaries',
    tags: ['Dictionaries'],
    query: ListQuerySchema,
    response: DictionaryPageResultSchema,
  })
  async list(@Query(new ZodValidationPipe(ListQuerySchema)) query: ListQuery) {
    const page = await this.repository.listDictionaries(normalizedListQuery(query))
    return paginatedSuccess(page.list, page.total)
  }

  @Post('/admin/dictionaries')
  @RequirePermissions(authorizationPermissionKeys.dictionariesManage)
  @ContractRoute({
    operationId: 'createDictionary',
    tags: ['Dictionaries'],
    body: DictionaryRequestSchema,
    response: MutationResultSchema,
  })
  create(
    @Body(new ZodValidationPipe(DictionaryRequestSchema)) body: DictionaryRequest,
    @CurrentAccessUser() actor: CurrentUser,
  ) {
    return mutationResult(() => this.repository.createDictionary(body, actor.id))
  }

  @Put('/admin/dictionaries/:id')
  @RequirePermissions(authorizationPermissionKeys.dictionariesManage)
  @ContractRoute({
    operationId: 'updateDictionary',
    tags: ['Dictionaries'],
    params: IdParamsSchema,
    body: DictionaryRequestSchema,
    response: MutationResultSchema,
  })
  async update(
    @Param(new ZodValidationPipe(IdParamsSchema)) params: IdParams,
    @Body(new ZodValidationPipe(DictionaryRequestSchema)) body: DictionaryRequest,
    @CurrentAccessUser() actor: CurrentUser,
  ) {
    ensureUpdated(await this.repository.updateDictionary(params.id, body, actor.id))
    return success({ id: params.id })
  }

  @Delete('/admin/dictionaries/:id')
  @RequirePermissions(authorizationPermissionKeys.dictionariesManage)
  @ContractRoute({
    operationId: 'deleteDictionary',
    tags: ['Dictionaries'],
    params: IdParamsSchema,
    response: EmptyResultSchema,
  })
  async remove(
    @Param(new ZodValidationPipe(IdParamsSchema)) params: IdParams,
    @CurrentAccessUser() actor: CurrentUser,
  ) {
    ensureUpdated(await this.repository.softDeleteDictionary(params.id, actor.id))
    return success()
  }
}
