import type {
  FastifyError,
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
} from 'fastify'
import { ErrorCode } from '../shared/errors/error-codes.js'
import { failure } from '../shared/http/response.js'

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
      return httpStatus >= 500
        ? ErrorCode.INTERNAL_ERROR
        : ErrorCode.INVALID_REQUEST
  }
}

function errorMessage(error: FastifyError, httpStatus: number): string {
  if (error.validation) {
    return 'Invalid request'
  }

  if (errorCodeForHttpStatus(httpStatus) === ErrorCode.INTERNAL_ERROR) {
    return 'Internal server error'
  }

  return error.message
}

function responseHttpStatus(sourceHttpStatus: number): number {
  switch (sourceHttpStatus) {
    case 401:
    case 404:
    case 500:
      return sourceHttpStatus
    default:
      return 200
  }
}

async function handleNotFound(
  _request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  await reply
    .code(404)
    .send(failure(ErrorCode.RESOURCE_NOT_FOUND, 'Resource not found'))
}

async function handleError(
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const sourceHttpStatus = error.validation
    ? 400
    : Math.max(400, error.statusCode ?? 500)

  if (sourceHttpStatus >= 500) {
    request.log.error(error)
  }

  await reply
    .code(responseHttpStatus(sourceHttpStatus))
    .send(
      failure(
        errorCodeForHttpStatus(sourceHttpStatus),
        errorMessage(error, sourceHttpStatus)
      )
    )
}

export async function registerResponseHandling(
  app: FastifyInstance
): Promise<void> {
  app.setNotFoundHandler(handleNotFound)
  app.setErrorHandler(handleError)
}
