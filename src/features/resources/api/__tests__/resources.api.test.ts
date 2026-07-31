import { HttpResponse, http } from 'msw'
import { describe, expect, it } from 'vitest'
import { ApiError } from '../../../../api/api-error'
import {
  createResource,
  deleteResource,
  getResource,
  listResources,
  provisionResource,
  replaceResource,
  updateBasicInfo,
  updateProjectDetails,
} from '../resources.api'
import {
  createCompleteResourceFixture,
  createResourceFixture,
} from '../../../../test/fixtures'
import { server } from '../../../../test/server'
import {
  RESOURCE_CONTRACT_ERROR_MESSAGE,
  RESOURCE_LIST_CONTRACT_ERROR_MESSAGE,
} from '../resource-response.schemas'

const apiUrl = 'http://localhost:5001/api'

describe('resources API', () => {
  it('creates a resource using the backend request shape', async () => {
    const resource = createCompleteResourceFixture({ status: 'draft' })

    server.use(
      http.post(`${apiUrl}/resources`, async ({ request }) => {
        expect(await request.json()).toEqual({
          resourceName: 'Customer onboarding',
        })
        return HttpResponse.json(resource, { status: 201 })
      }),
    )

    await expect(createResource('Customer onboarding')).resolves.toEqual(resource)
  })

  it('sends a complete Basic Info payload through the module endpoint', async () => {
    const resource = createCompleteResourceFixture({ status: 'draft' })

    server.use(
      http.patch(`${apiUrl}/resources/1/basic-info`, async ({ request }) => {
        expect(await request.json()).toEqual(resource.basicInfo)
        return HttpResponse.json(resource)
      }),
    )

    await expect(updateBasicInfo(1, resource.basicInfo)).resolves.toEqual(resource)
  })

  it('sends only business fields in a completed-resource PUT', async () => {
    const resource = createCompleteResourceFixture()
    const payload = {
      name: resource.name,
      basicInfo: resource.basicInfo,
      projectDetails: resource.projectDetails,
    }

    server.use(
      http.put(`${apiUrl}/resources/1`, async ({ request }) => {
        expect(await request.json()).toEqual(payload)
        return HttpResponse.json(resource)
      }),
    )

    await expect(replaceResource(1, payload)).resolves.toEqual(resource)
  })

  it('maps backend errors to ApiError', async () => {
    server.use(
      http.get(`${apiUrl}/resources/999`, () =>
        HttpResponse.json(
          { message: 'Resource not found', details: {} },
          { status: 404 },
        ),
      ),
    )

    await expect(getResource(999)).rejects.toEqual(
      expect.objectContaining<ApiError>({
        name: 'ApiError',
        message: 'Resource not found',
        status: 404,
      }),
    )
  })

  it('accepts an incomplete draft returned by the backend', async () => {
    const resource = createResourceFixture()

    server.use(http.get(`${apiUrl}/resources/1`, () => HttpResponse.json(resource)))

    await expect(getResource(1)).resolves.toEqual(resource)
  })

  it('maps a malformed resource response to a contract ApiError', async () => {
    server.use(
      http.get(`${apiUrl}/resources/1`, () =>
        HttpResponse.json({
          ...createResourceFixture(),
          status: 'archived',
        }),
      ),
    )

    await expect(getResource(1)).rejects.toEqual(
      expect.objectContaining<ApiError>({
        name: 'ApiError',
        message: RESOURCE_CONTRACT_ERROR_MESSAGE,
        status: 502,
      }),
    )
  })

  it('serializes list filters and pagination as query parameters', async () => {
    server.use(
      http.get(`${apiUrl}/resources`, ({ request }) => {
        const url = new URL(request.url)
        expect(Object.fromEntries(url.searchParams)).toEqual({
          page: '2',
          pageSize: '10',
          sortOrder: 'asc',
          status: 'draft',
          name: 'onboarding',
        })
        return HttpResponse.json({
          items: [],
          pagination: {
            page: 2,
            pageSize: 10,
            totalItems: 0,
            totalPages: 1,
          },
        })
      }),
    )

    await listResources({
      page: 2,
      pageSize: 10,
      sortOrder: 'asc',
      status: 'draft',
      name: ' onboarding ',
    })
  })

  it('maps malformed list pagination to a contract ApiError', async () => {
    server.use(
      http.get(`${apiUrl}/resources`, () =>
        HttpResponse.json({
          items: [],
          pagination: {
            page: 0,
            pageSize: 10,
            totalItems: 0,
            totalPages: 0,
          },
        }),
      ),
    )

    await expect(
      listResources({
        page: 1,
        pageSize: 10,
        sortOrder: 'asc',
      }),
    ).rejects.toEqual(
      expect.objectContaining<ApiError>({
        name: 'ApiError',
        message: RESOURCE_LIST_CONTRACT_ERROR_MESSAGE,
        status: 502,
      }),
    )
  })

  it('uses the dedicated Project Details and provisioning endpoints', async () => {
    const draft = createCompleteResourceFixture({ status: 'draft' })
    const completed = { ...draft, status: 'completed' as const }
    let projectPayload: unknown

    server.use(
      http.patch(`${apiUrl}/resources/1/project-details`, async ({ request }) => {
        projectPayload = await request.json()
        return HttpResponse.json(draft)
      }),
      http.patch(`${apiUrl}/resources/1/provisioning`, () =>
        HttpResponse.json(completed),
      ),
    )

    await updateProjectDetails(1, draft.projectDetails)
    expect(projectPayload).toEqual(draft.projectDetails)
    await expect(provisionResource(1)).resolves.toEqual(completed)
  })

  it('deletes a resource using its encoded identifier', async () => {
    const resource = createCompleteResourceFixture()
    server.use(http.delete(`${apiUrl}/resources/1`, () => HttpResponse.json(resource)))

    await expect(deleteResource(1)).resolves.toEqual(resource)
  })

  it('maps transport failures to a safe connection error', async () => {
    server.use(http.get(`${apiUrl}/resources/1`, () => HttpResponse.error()))

    await expect(getResource(1)).rejects.toEqual(
      expect.objectContaining({
        message: 'Unable to connect to the API.',
        status: 0,
      }),
    )
  })
})
