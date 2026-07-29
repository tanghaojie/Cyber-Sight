export type GlobalHttpErrorStatus = 401 | 404 | 500

export interface GlobalHttpErrorDetail {
  httpStatus: GlobalHttpErrorStatus
  status?: number
  err?: string
}

export type GlobalHttpErrorHandler = (detail: GlobalHttpErrorDetail) => void | Promise<void>

let globalHttpErrorHandler: GlobalHttpErrorHandler | undefined

export function installGlobalHttpErrorHandler(handler: GlobalHttpErrorHandler): () => void {
  globalHttpErrorHandler = handler
  return function uninstallHandler() {
    if (globalHttpErrorHandler === handler) {
      globalHttpErrorHandler = undefined
    }
  }
}

function isGlobalHttpErrorStatus(status: number): status is GlobalHttpErrorStatus {
  return status === 401 || status === 404 || status === 500
}

async function readErrorBody(response: Response): Promise<{ status?: number; err?: string }> {
  try {
    const body: unknown = await response.clone().json()
    return typeof body === 'object' && body !== null ? body : {}
  } catch {
    return {}
  }
}

export async function handleGlobalHttpError(response: Response): Promise<void> {
  if (!isGlobalHttpErrorStatus(response.status) || !globalHttpErrorHandler) {
    return
  }
  const body = await readErrorBody(response)
  await globalHttpErrorHandler({ httpStatus: response.status, status: body.status, err: body.err })
}
