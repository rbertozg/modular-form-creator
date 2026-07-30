import { ApiError, type ApiErrorPayload } from './api-error'

const DEFAULT_API_BASE_URL = 'http://localhost:5001/api'
const REQUEST_TIMEOUT_MS = 10_000

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL).replace(
  /\/+$/,
  '',
)

function parseResponseBody(text: string): unknown {
  if (!text) {
    return undefined
  }

  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const controller = new AbortController()
  const timeoutId = window.setTimeout(
    () => controller.abort('Request timed out'),
    REQUEST_TIMEOUT_MS,
  )
  const abortFromCaller = () => controller.abort(init.signal?.reason)

  if (init.signal?.aborted) {
    abortFromCaller()
  } else {
    init.signal?.addEventListener('abort', abortFromCaller, { once: true })
  }

  try {
    const response = await fetch(`${apiBaseUrl}${path}`, {
      ...init,
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        ...(init.body ? { 'Content-Type': 'application/json' } : {}),
        ...init.headers,
      },
    })
    const body = parseResponseBody(await response.text())

    if (!response.ok) {
      const payload =
        typeof body === 'object' && body !== null ? (body as ApiErrorPayload) : undefined

      throw new ApiError(
        payload?.message || `Request failed with status ${response.status}.`,
        response.status,
        payload?.details,
      )
    }

    return body as T
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }

    if (controller.signal.aborted) {
      throw new ApiError('The request was cancelled or timed out.', 0)
    }

    throw new ApiError('Unable to connect to the API.', 0)
  } finally {
    window.clearTimeout(timeoutId)
    init.signal?.removeEventListener('abort', abortFromCaller)
  }
}
