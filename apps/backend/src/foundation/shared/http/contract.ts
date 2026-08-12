import {
  applyDecorators,
  Inject,
  SetMetadata,
  type CallHandler,
  type ExecutionContext,
  type NestInterceptor,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger'
import { toOpenApiSchema } from '@cyber-ai-forge/api-contract'
import { map, type Observable } from 'rxjs'
import { z } from 'zod'

export const contractResponseSchemaKey = Symbol('contractResponseSchema')

interface ContractRouteOptions {
  operationId: string
  tags: string[]
  summary?: string
  body?: z.ZodType
  query?: z.ZodType
  params?: z.ZodType
  response: z.ZodType
  public?: boolean
}

interface ObjectSchema {
  properties?: Record<string, Record<string, unknown>>
  required?: string[]
}

function parameterDecorators(
  schema: z.ZodType,
  factory: (options: never) => MethodDecorator,
): MethodDecorator[] {
  const jsonSchema = toOpenApiSchema(schema) as ObjectSchema
  const required = new Set(jsonSchema.required ?? [])
  return Object.entries(jsonSchema.properties ?? {}).map(([name, property]) =>
    factory({ name, required: required.has(name), schema: property } as never),
  )
}

/**
 * 一个装饰器同时挂载响应运行时契约和 Swagger 元数据，避免为 Nest 重写 DTO。
 */
export function ContractRoute(options: ContractRouteOptions): MethodDecorator {
  const decorators: MethodDecorator[] = [
    SetMetadata(contractResponseSchemaKey, options.response),
    ApiOperation({
      operationId: options.operationId,
      summary: options.summary,
      tags: options.tags,
      security: options.public ? [] : undefined,
    }),
    ApiResponse({ status: 200, schema: toOpenApiSchema(options.response) }),
  ]

  if (!options.public) {
    decorators.push(ApiBearerAuth('bearerAuth'))
  }
  if (options.body) {
    decorators.push(ApiBody({ schema: toOpenApiSchema(options.body) }))
  }
  if (options.query) {
    decorators.push(...parameterDecorators(options.query, ApiQuery))
  }
  if (options.params) {
    decorators.push(...parameterDecorators(options.params, ApiParam))
  }
  return applyDecorators(...decorators)
}

export class ContractResponseInterceptor implements NestInterceptor {
  constructor(@Inject(Reflector) private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const schema = this.reflector.get<z.ZodType>(contractResponseSchemaKey, context.getHandler())
    if (!schema) {
      return next.handle()
    }
    return next.handle().pipe(map((response) => schema.parse(response)))
  }
}
