import { describe, expect, it } from 'vitest'
import { ApiError } from '../../../api/api-error'
import { createResourceFixture } from '../../../test/fixtures'
import {
  parseResourceListResponse,
  parseResourceResponse,
  RESOURCE_CONTRACT_ERROR_MESSAGE,
  RESOURCE_LIST_CONTRACT_ERROR_MESSAGE,
} from './resource-response.schemas'

function captureError(run: () => unknown): unknown {
  try {
    run()
  } catch (error) {
    return error
  }

  throw new Error('Expected contract parsing to fail.')
}

describe('resource API response schemas', () => {
  it('accepts a legal incomplete draft and a valid list response', () => {
    const draft = createResourceFixture()
    const listResponse = {
      items: [draft],
      pagination: {
        page: 1,
        pageSize: 10,
        totalItems: 1,
        totalPages: 1,
      },
    }

    expect(parseResourceResponse(draft)).toEqual(draft)
    expect(parseResourceListResponse(listResponse)).toEqual(listResponse)
  })

  it.each([
    {
      caseName: 'unknown status',
      response: {
        ...createResourceFixture(),
        status: 'archived',
      },
    },
    {
      caseName: 'invalid module shape',
      response: {
        ...createResourceFixture(),
        basicInfo: {
          ...createResourceFixture().basicInfo,
          owner: null,
        },
      },
    },
  ])('rejects a resource with $caseName', ({ response }) => {
    const error = captureError(() => parseResourceResponse(response))

    expect(error).toBeInstanceOf(ApiError)
    expect(error).toEqual(
      expect.objectContaining({
        message: RESOURCE_CONTRACT_ERROR_MESSAGE,
        status: 502,
      }),
    )
  })

  it('rejects invalid pagination', () => {
    const error = captureError(() =>
      parseResourceListResponse({
        items: [],
        pagination: {
          page: 0,
          pageSize: 10,
          totalItems: -1,
          totalPages: 0,
        },
      }),
    )

    expect(error).toBeInstanceOf(ApiError)
    expect(error).toEqual(
      expect.objectContaining({
        message: RESOURCE_LIST_CONTRACT_ERROR_MESSAGE,
        status: 502,
      }),
    )
  })
})
