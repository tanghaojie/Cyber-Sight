export type GlobalHttpErrorStatus = 401 | 404 | 500

export interface GlobalHttpErrorDetail {
  httpStatus: GlobalHttpErrorStatus
  status?: number
  err?: string
}

export type GlobalHttpErrorHandler = (detail: GlobalHttpErrorDetail) => void | Promise<void>

// HTTP 客户端不直接依赖 Router/Pinia，应用启动时通过该单例端口注入副作用。
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
    // clone 避免消费原响应体，业务请求仍可在全局处理后读取同一响应。
    const body: unknown = await response.clone().json()
    return typeof body === 'object' && body !== null ? body : {}
  } catch {
    return {}
  }
}

export async function handleGlobalHttpError(response: Response): Promise<void> {
  // 只有仓库约定的三个全局 HTTP 状态由应用统一处理，其余错误留给业务模块。
  if (!isGlobalHttpErrorStatus(response.status) || !globalHttpErrorHandler) {
    return
  }
  const body = await readErrorBody(response)
  await globalHttpErrorHandler({ httpStatus: response.status, status: body.status, err: body.err })
}
