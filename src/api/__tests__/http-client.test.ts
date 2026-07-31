import { HttpResponse, http } from 'msw'
import { describe, expect, it } from 'vitest'
import { server } from '../../test/server'
import { apiRequest } from '../http-client'

const apiUrl = 'http://localhost:5001/api'

describe('HTTP client response handling', () => {
  it('supports successful plain-text responses', async () => {
    server.use(http.get(`${apiUrl}/plain`, () => HttpResponse.text('plain response')))

    await expect(apiRequest<string>('/plain')).resolves.toBe('plain response')
  })

  it('supports successful responses without a body', async () => {
    server.use(
      http.delete(`${apiUrl}/empty`, () => new HttpResponse(null, { status: 204 })),
    )

    await expect(
      apiRequest<undefined>('/empty', { method: 'DELETE' }),
    ).resolves.toBeUndefined()
  })

  it('uses a safe fallback for a non-JSON error response', async () => {
    server.use(
      http.get(`${apiUrl}/plain-error`, () =>
        HttpResponse.text('Internal stack trace', { status: 500 }),
      ),
    )

    await expect(apiRequest('/plain-error')).rejects.toEqual(
      expect.objectContaining({
        message: 'Request failed with status 500.',
        status: 500,
      }),
    )
  })

  it('respects an already aborted caller signal', async () => {
    const controller = new AbortController()
    controller.abort()

    await expect(apiRequest('/cancelled', { signal: controller.signal })).rejects.toEqual(
      expect.objectContaining({
        message: 'The request was cancelled or timed out.',
        status: 0,
      }),
    )
  })
})
