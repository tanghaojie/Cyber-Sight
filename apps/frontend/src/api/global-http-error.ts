export const GLOBAL_HTTP_ERROR_EVENT = 'api:global-http-error'

export type GlobalHttpErrorStatus = 401 | 404 | 500

export interface GlobalHttpErrorDetail {
  httpStatus: GlobalHttpErrorStatus
  status?: number
  err?: string
}

function isGlobalHttpErrorStatus(status: number): status is GlobalHttpErrorStatus {
  return status === 401 || status === 404 || status === 500
}

function isErrorBody(value: unknown): value is { status?: number; err?: string } {
  return typeof value === 'object' && value !== null
}

async function readErrorBody(
  response: Response
): Promise<{ status?: number; err?: string }> {
  try {
    const body: unknown = await response.clone().json()
    return isErrorBody(body) ? body : {}
  } catch {
    return {}
  }
}

export async function dispatchGlobalHttpError(response: Response): Promise<void> {
  if (!isGlobalHttpErrorStatus(response.status)) {
    return
  }

  const body = await readErrorBody(response)
  const detail: GlobalHttpErrorDetail = {
    httpStatus: response.status,
    status: body.status,
    err: body.err,
  }

  window.dispatchEvent(
    new CustomEvent<GlobalHttpErrorDetail>(GLOBAL_HTTP_ERROR_EVENT, { detail })
  )
}
