import { describe, expect, it } from 'vitest'
import {
  ApiError,
  getErrorMessage,
  isPotentiallyCommittedMutationError,
} from '../api-error'

describe('API error helpers', () => {
  it('returns messages from Error instances', () => {
    expect(getErrorMessage(new ApiError('Validation failed', 400))).toBe(
      'Validation failed',
    )
  })

  it('does not expose unknown thrown values', () => {
    expect(getErrorMessage({ secret: 'internal value' })).toBe(
      'An unexpected error occurred.',
    )
  })

  it.each([
    { error: new ApiError('Network failure', 0), expected: true },
    { error: new ApiError('Invalid response', 502), expected: true },
    { error: new ApiError('Validation failed', 400), expected: false },
    { error: new Error('Unknown failure'), expected: false },
  ])(
    'classifies whether a mutation may have reached the server',
    ({ error, expected }) => {
      expect(isPotentiallyCommittedMutationError(error)).toBe(expected)
    },
  )
})
