export interface ApiErrorPayload {
  message?: string
  details?: unknown
}

export class ApiError extends Error {
  readonly status: number
  readonly details?: unknown

  constructor(message: string, status: number, details?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }

  return 'An unexpected error occurred.'
}

export function isPotentiallyCommittedMutationError(error: unknown): error is ApiError {
  return error instanceof ApiError && (error.status === 0 || error.status >= 500)
}
