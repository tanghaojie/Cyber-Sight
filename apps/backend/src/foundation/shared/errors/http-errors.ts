import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common'

export function invalidRequest(message = 'Invalid request'): BadRequestException {
  return new BadRequestException(message)
}

export function unauthorized(message = 'Authentication required'): UnauthorizedException {
  return new UnauthorizedException(message)
}

export function forbidden(message = 'Permission required'): ForbiddenException {
  return new ForbiddenException(message)
}

export function notFound(message = 'Resource not found'): NotFoundException {
  return new NotFoundException(message)
}

export function conflict(message = 'Resource conflict'): ConflictException {
  return new ConflictException(message)
}

export function internalError(message = 'Internal server error'): InternalServerErrorException {
  return new InternalServerErrorException(message)
}
