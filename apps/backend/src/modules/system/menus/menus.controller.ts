import { Body, Controller, Delete, Get, Inject, Param, Post, Put, Query } from '@nestjs/common'
import {
  EmptyResultSchema,
  IdParamsSchema,
  ListQuerySchema,
  MenuListResponseSchema,
  MenuPageResultSchema,
  MenuRequestSchema,
  MutationResultSchema,
  NavigationMenuResponseSchema,
  isValidMenuPath,
  type CurrentUser,
  type EntityId,
  type IdParams,
  type ListQuery,
  type MenuRequest,
} from '@cyber-ai-forge/api-contract'
import {
  Authenticated,
  CurrentAccessUser,
  RequirePermissions,
} from '@/modules/system/authorization/authorization.guard.js'
import { AuthorizationReferences } from '@/modules/system/authorization/authorization.references.js'
import { authorizationPermissionKeys } from '@/modules/system/authorization/authorization.resources.js'
import { ErrorCode } from '@/shared/errors/error-codes.js'
import { ContractRoute } from '@/shared/http/contract.js'
import { ensureUpdated, mutationResult, normalizedListQuery } from '@/shared/http/route-helpers.js'
import { failure, paginatedSuccess, success } from '@/shared/http/response.js'
import { ZodValidationPipe } from '@/shared/http/zod-validation.pipe.js'
import { MenusRepository } from './menus.repository.js'

@Controller()
export class MenusController {
  constructor(
    @Inject(MenusRepository)
    private readonly repository: MenusRepository,
    @Inject(AuthorizationReferences)
    private readonly authorizationReferences: AuthorizationReferences,
  ) {}

  @Get('/admin/menus')
  @RequirePermissions(authorizationPermissionKeys.menusManage)
  @ContractRoute({
    operationId: 'listMenus',
    tags: ['Menus'],
    query: ListQuerySchema,
    response: MenuPageResultSchema,
  })
  async list(@Query(new ZodValidationPipe(ListQuerySchema)) query: ListQuery) {
    const page = await this.repository.listMenus(normalizedListQuery(query))
    return paginatedSuccess(page.list, page.total)
  }

  @Get('/navigation/menus')
  @Authenticated()
  @ContractRoute({
    operationId: 'getCurrentNavigation',
    tags: ['Navigation'],
    response: NavigationMenuResponseSchema,
  })
  async navigation(@CurrentAccessUser() user: CurrentUser) {
    return success(await this.repository.listNavigationMenus(user))
  }

  @Get('/admin/menus/tree')
  @RequirePermissions(
    authorizationPermissionKeys.menusManage,
    authorizationPermissionKeys.rolesManage,
  )
  @ContractRoute({
    operationId: 'listMenuTree',
    tags: ['Menus'],
    response: MenuListResponseSchema,
  })
  async tree() {
    return success(await this.repository.listAllMenus())
  }

  @Post('/admin/menus')
  @RequirePermissions(authorizationPermissionKeys.menusManage)
  @ContractRoute({
    operationId: 'createMenu',
    tags: ['Menus'],
    body: MenuRequestSchema,
    response: MutationResultSchema,
  })
  async create(
    @Body(new ZodValidationPipe(MenuRequestSchema)) body: MenuRequest,
    @CurrentAccessUser() actor: CurrentUser,
  ) {
    const validation = await this.validateMenu(body)
    if (validation) {
      return validation
    }
    return mutationResult(() => this.repository.createMenu(body, actor.id))
  }

  @Put('/admin/menus/:id')
  @RequirePermissions(authorizationPermissionKeys.menusManage)
  @ContractRoute({
    operationId: 'updateMenu',
    tags: ['Menus'],
    params: IdParamsSchema,
    body: MenuRequestSchema,
    response: MutationResultSchema,
  })
  async update(
    @Param(new ZodValidationPipe(IdParamsSchema)) params: IdParams,
    @Body(new ZodValidationPipe(MenuRequestSchema)) body: MenuRequest,
    @CurrentAccessUser() actor: CurrentUser,
  ) {
    const validation = await this.validateMenu(body, params.id)
    if (validation) {
      return validation
    }
    ensureUpdated(await this.repository.updateMenu(params.id, body, actor.id))
    return success({ id: params.id })
  }

  @Delete('/admin/menus/:id')
  @RequirePermissions(authorizationPermissionKeys.menusManage)
  @ContractRoute({
    operationId: 'deleteMenu',
    tags: ['Menus'],
    params: IdParamsSchema,
    response: EmptyResultSchema,
  })
  async remove(
    @Param(new ZodValidationPipe(IdParamsSchema)) params: IdParams,
    @CurrentAccessUser() actor: CurrentUser,
  ) {
    if (await this.repository.hasActiveMenuChildren(params.id)) {
      return failure(
        ErrorCode.RESOURCE_CONFLICT,
        'Delete child menus before deleting this directory',
      )
    }
    ensureUpdated(await this.repository.softDeleteMenu(params.id, actor.id))
    return success()
  }

  private async validateMenu(body: MenuRequest, currentId?: EntityId) {
    if (!isValidMenuPath(body)) {
      return failure(ErrorCode.INVALID_REQUEST, 'Root menu path must start with /')
    }
    if (!(await this.repository.validateMenuParent(body.parentId, currentId))) {
      return failure(
        ErrorCode.INVALID_REQUEST,
        currentId
          ? 'Parent menu must be a directory outside the current subtree'
          : 'Parent menu must be an existing directory',
      )
    }
    if (
      body.requiredPermissionKey &&
      !(await this.authorizationReferences.activePermissionKeyExists(body.requiredPermissionKey))
    ) {
      return failure(ErrorCode.INVALID_REQUEST, 'Permission key is not active')
    }
    return null
  }
}
