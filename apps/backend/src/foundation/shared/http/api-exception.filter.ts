import {
  Catch,
  HttpException,
  HttpStatus,
  type ArgumentsHost,
  type ExceptionFilter,
} from '@nestjs/common'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { ErrorCode } from '@/foundation/shared/errors/error-codes.js'
import { failure } from './response.js'

function errorCodeForHttpStatus(httpStatus: number): number {
  switch (httpStatus) {
    case 400:
      return ErrorCode.INVALID_REQUEST
    case 401:
      return ErrorCode.UNAUTHORIZED
    case 403:
      return ErrorCode.FORBIDDEN
    case 404:
      return ErrorCode.RESOURCE_NOT_FOUND
    case 409:
      return ErrorCode.RESOURCE_CONFLICT
    case 429:
      return ErrorCode.RATE_LIMITED
    case 502:
    case 503:
    case 504:
      return ErrorCode.EXTERNAL_DEPENDENCY_ERROR
    default:
      return httpStatus >= 500 ? ErrorCode.INTERNAL_ERROR : ErrorCode.INVALID_REQUEST
  }
}

function responseHttpStatus(sourceHttpStatus: number): number {
  return sourceHttpStatus === 401 || sourceHttpStatus === 404 || sourceHttpStatus === 500
    ? sourceHttpStatus
    : 200
}

function publicMessage(exception: unknown, sourceHttpStatus: number): string {
  if (sourceHttpStatus === 400) {
    return 'Invalid request'
  }
  if (sourceHttpStatus === 404) {
    return 'Resource not found'
  }
  if (errorCodeForHttpStatus(sourceHttpStatus) === ErrorCode.INTERNAL_ERROR) {
    return 'Internal server error'
  }
  return exception instanceof Error ? exception.message : 'Invalid request'
}

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const http = host.switchToHttp()
    const request = http.getRequest<FastifyRequest>()
    const reply = http.getResponse<FastifyReply>()
    const sourceHttpStatus =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR

    if (sourceHttpStatus >= 500) {
      request.log.error(exception)
    }

    void reply
      .status(responseHttpStatus(sourceHttpStatus))
      .send(
        failure(
          errorCodeForHttpStatus(sourceHttpStatus),
          publicMessage(exception, sourceHttpStatus),
        ),
      )
  }
}
