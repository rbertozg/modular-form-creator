import { HttpResponse, http } from 'msw'
import { screen, waitFor, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { Resource, ResourceListResponse } from '../../api/resources.types'
import {
  createCompleteResourceFixture,
  createResourceFixture,
} from '../../../../test/fixtures'
import { renderAppRoute } from '../../../../test/render-app'
import { server } from '../../../../test/server'
import { useEditBuffer } from '../../edit-buffer/useEditBuffer'
import { ResourcesPage } from '../ResourcesPage/ResourcesPage'

const apiUrl = 'http://localhost:5001/api'

function createListResponse(
  overrides: Partial<ResourceListResponse> = {},
): ResourceListResponse {
  return {
    items: [createResourceFixture()],
    pagination: {
      page: 1,
      pageSize: 10,
      totalItems: 1,
      totalPages: 1,
    },
    ...overrides,
  }
}

const routes = [
  { path: '/resources', element: <ResourcesPage /> },
  {
    path: '/resources/:resourceId',
    element: <h1>Opened resource</h1>,
  },
]

function BufferedResourcesPage({ resource }: { resource: Resource }) {
  const editBuffer = useEditBuffer()
  const hasBuffer = Boolean(editBuffer.getEntry(resource.resourceId))

  return (
    <>
      <button
        type="button"
        onClick={() =>
          editBuffer.updateBasicInfo(resource, {
            ...resource.basicInfo,
            owner: 'Buffered Owner',
          })
        }
      >
        Seed edit buffer
      </button>
      <span>{hasBuffer ? 'Buffer active' : 'Buffer empty'}</span>
      <ResourcesPage />
    </>
  )
}

describe('resources list', () => {
  it('creates a resource and navigates to its overview', async () => {
    const createdResource = createResourceFixture({
      resourceId: 2,
      _id: '507f1f77bcf86cd799439022',
      name: 'New resource',
      basicInfo: {
        ...createResourceFixture().basicInfo,
        resourceName: 'New resource',
      },
    })

    server.use(
      http.get(`${apiUrl}/resources`, () => HttpResponse.json(createListResponse())),
      http.post(`${apiUrl}/resources`, async ({ request }) => {
        expect(await request.json()).toEqual({
          resourceName: 'New resource',
        })
        return HttpResponse.json(createdResource, { status: 201 })
      }),
    )

    const { user } = renderAppRoute(routes, '/resources')
    await screen.findByText('Customer onboarding')

    await user.click(screen.getByRole('button', { name: 'Create resource' }))
    await user.type(screen.getByLabelText('Resource name'), 'New resource')
    const createButtons = screen.getAllByRole('button', {
      name: 'Create resource',
    })
    await user.click(createButtons.at(-1)!)

    expect(
      await screen.findByRole('heading', { name: 'Opened resource' }),
    ).toBeInTheDocument()
  })

  it('keeps the create form open when the backend rejects a duplicate name', async () => {
    server.use(
      http.get(`${apiUrl}/resources`, () => HttpResponse.json(createListResponse())),
      http.post(`${apiUrl}/resources`, () =>
        HttpResponse.json({ message: 'resourceName must be unique' }, { status: 400 }),
      ),
    )

    const { user, router } = renderAppRoute(routes, '/resources')
    await screen.findByText('Customer onboarding')

    await user.click(screen.getByRole('button', { name: 'Create resource' }))
    const nameInput = screen.getByLabelText('Resource name')
    await user.type(nameInput, 'Customer onboarding')
    await user.click(screen.getAllByRole('button', { name: 'Create resource' }).at(-1)!)

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'resourceName must be unique',
    )
    expect(nameInput).toHaveValue('Customer onboarding')
    expect(router.state.location.pathname).toBe('/resources')
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('deletes a resource only after confirmation', async () => {
    const resource = createCompleteResourceFixture()
    let deleted = false
    let deleteRequests = 0

    server.use(
      http.get(`${apiUrl}/resources`, () =>
        HttpResponse.json(
          deleted
            ? createListResponse({
                items: [],
                pagination: {
                  page: 1,
                  pageSize: 10,
                  totalItems: 0,
                  totalPages: 1,
                },
              })
            : createListResponse({ items: [resource] }),
        ),
      ),
      http.delete(`${apiUrl}/resources/1`, () => {
        deleted = true
        deleteRequests += 1
        return HttpResponse.json(resource)
      }),
    )

    const { user } = renderAppRoute(
      [
        {
          path: '/resources',
          element: <BufferedResourcesPage resource={resource} />,
        },
      ],
      '/resources',
    )
    await screen.findByText('Customer onboarding')
    await user.click(screen.getByRole('button', { name: 'Seed edit buffer' }))
    expect(screen.getByText('Buffer active')).toBeInTheDocument()
    expect(
      screen.getByRole('region', { name: 'Unsaved local changes' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Unsaved changes')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Delete' }))

    expect(deleteRequests).toBe(0)
    const dialog = screen.getByRole('dialog')
    await user.click(within(dialog).getByRole('button', { name: 'Delete' }))

    await waitFor(() => expect(deleteRequests).toBe(1))
    expect(
      await screen.findByRole('heading', { name: 'No resources found' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Buffer empty')).toBeInTheDocument()
    expect(
      screen.queryByRole('region', { name: 'Unsaved local changes' }),
    ).not.toBeInTheDocument()
  })

  it('lists buffered resources hidden from the current server page', async () => {
    const bufferedResource = createCompleteResourceFixture({
      resourceId: 12,
      _id: '507f1f77bcf86cd799439032',
      name: 'Hidden buffered resource',
      basicInfo: {
        ...createCompleteResourceFixture().basicInfo,
        resourceName: 'Hidden buffered resource',
      },
    })
    const visibleDraft = createResourceFixture({
      resourceId: 1,
      name: 'Visible draft',
      basicInfo: {
        ...createResourceFixture().basicInfo,
        resourceName: 'Visible draft',
      },
    })

    server.use(
      http.get(`${apiUrl}/resources`, () =>
        HttpResponse.json(createListResponse({ items: [visibleDraft] })),
      ),
    )

    const { user } = renderAppRoute(
      [
        {
          path: '/resources',
          element: <BufferedResourcesPage resource={bufferedResource} />,
        },
      ],
      '/resources',
    )
    await screen.findByText('Visible draft')
    await user.click(screen.getByRole('button', { name: 'Seed edit buffer' }))

    const panel = screen.getByRole('region', {
      name: 'Unsaved local changes',
    })
    expect(
      within(panel).getByRole('link', {
        name: 'Hidden buffered resource — Review',
      }),
    ).toHaveAttribute('href', '/resources/12')
    expect(screen.queryByText('Unsaved changes')).not.toBeInTheDocument()
  })

  it('shows a failed deletion inside the open confirmation dialog', async () => {
    let verificationRequests = 0

    server.use(
      http.get(`${apiUrl}/resources`, () => HttpResponse.json(createListResponse())),
      http.get(`${apiUrl}/resources/1`, () => {
        verificationRequests += 1
        return HttpResponse.json(createResourceFixture())
      }),
      http.delete(`${apiUrl}/resources/1`, () =>
        HttpResponse.json({ message: 'Delete failed' }, { status: 500 }),
      ),
    )

    const { user } = renderAppRoute(routes, '/resources')
    await screen.findByText('Customer onboarding')
    await user.click(screen.getByRole('button', { name: 'Delete' }))

    const dialog = screen.getByRole('dialog', {
      name: 'Delete resource?',
    })
    await user.click(within(dialog).getByRole('button', { name: 'Delete' }))

    expect(await within(dialog).findByRole('alert')).toHaveTextContent('Delete failed')
    expect(await within(dialog).findByRole('button', { name: 'Delete' })).toBeEnabled()
    expect(verificationRequests).toBe(1)
  })

  it('reconciles a deletion that returns an invalid response', async () => {
    const resource = createCompleteResourceFixture()
    let deleted = false
    let deleteRequests = 0

    server.use(
      http.get(`${apiUrl}/resources`, () =>
        HttpResponse.json(
          deleted
            ? createListResponse({
                items: [],
                pagination: {
                  page: 1,
                  pageSize: 10,
                  totalItems: 0,
                  totalPages: 1,
                },
              })
            : createListResponse({ items: [resource] }),
        ),
      ),
      http.get(`${apiUrl}/resources/1`, () =>
        deleted
          ? HttpResponse.json({ message: 'Resource not found' }, { status: 404 })
          : HttpResponse.json(resource),
      ),
      http.delete(`${apiUrl}/resources/1`, () => {
        deleted = true
        deleteRequests += 1
        return HttpResponse.json({ deleted: true })
      }),
    )

    const { user } = renderAppRoute(
      [
        {
          path: '/resources',
          element: <BufferedResourcesPage resource={resource} />,
        },
      ],
      '/resources',
    )
    await screen.findByText('Customer onboarding')
    await user.click(screen.getByRole('button', { name: 'Seed edit buffer' }))
    await user.click(screen.getByRole('button', { name: 'Delete' }))
    await user.click(
      within(screen.getByRole('dialog')).getByRole('button', {
        name: 'Delete',
      }),
    )

    expect(
      await screen.findByRole('heading', { name: 'No resources found' }),
    ).toBeInTheDocument()
    expect(
      await screen.findByText(/no longer present on the server/i),
    ).toBeInTheDocument()
    expect(screen.getByText('Buffer empty')).toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(deleteRequests).toBe(1)
  })

  it('reports a failed list refresh after confirming an ambiguous deletion', async () => {
    const resource = createCompleteResourceFixture()
    let listRequests = 0

    server.use(
      http.get(`${apiUrl}/resources`, () => {
        listRequests += 1

        return listRequests === 1
          ? HttpResponse.json(createListResponse({ items: [resource] }))
          : HttpResponse.json({ message: 'List refresh failed' }, { status: 500 })
      }),
      http.get(`${apiUrl}/resources/1`, () =>
        HttpResponse.json({ message: 'Resource not found' }, { status: 404 }),
      ),
      http.delete(`${apiUrl}/resources/1`, () => HttpResponse.json({ deleted: true })),
    )

    const { user } = renderAppRoute(
      [
        {
          path: '/resources',
          element: <BufferedResourcesPage resource={resource} />,
        },
      ],
      '/resources',
    )
    await screen.findByText('Customer onboarding')
    await user.click(screen.getByRole('button', { name: 'Seed edit buffer' }))
    await user.click(screen.getByRole('button', { name: 'Delete' }))
    await user.click(
      within(screen.getByRole('dialog')).getByRole('button', {
        name: 'Delete',
      }),
    )

    expect(
      await screen.findByText(/deletion was confirmed.*could not be synchronized/i),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument()
    expect(screen.getByText('Buffer empty')).toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('sends filters, sorting, search, and pagination to the backend', async () => {
    const requestedUrls: URL[] = []

    server.use(
      http.get(`${apiUrl}/resources`, ({ request }) => {
        const url = new URL(request.url)
        requestedUrls.push(url)
        const page = Number(url.searchParams.get('page') ?? 1)
        return HttpResponse.json(
          createListResponse({
            pagination: {
              page,
              pageSize: 10,
              totalItems: 11,
              totalPages: 2,
            },
          }),
        )
      }),
    )

    const { user } = renderAppRoute(routes, '/resources')
    await screen.findByText('Customer onboarding')

    await user.selectOptions(screen.getByLabelText('Status'), 'draft')
    await user.selectOptions(screen.getByLabelText('Sort'), 'asc')
    await user.type(screen.getByLabelText('Search'), 'onboarding')

    await waitFor(
      () =>
        expect(
          requestedUrls.some(
            (url) =>
              url.searchParams.get('status') === 'draft' &&
              url.searchParams.get('sortOrder') === 'asc' &&
              url.searchParams.get('name') === 'onboarding',
          ),
        ).toBe(true),
      { timeout: 2_000 },
    )

    await user.click(screen.getByRole('button', { name: 'Next' }))
    await waitFor(() =>
      expect(requestedUrls.some((url) => url.searchParams.get('page') === '2')).toBe(
        true,
      ),
    )
  })

  it('moves to the previous page after deleting its last resource', async () => {
    const lastResource = createResourceFixture({
      resourceId: 11,
      _id: '507f1f77bcf86cd799439031',
      name: 'Last resource',
      basicInfo: {
        ...createResourceFixture().basicInfo,
        resourceName: 'Last resource',
      },
    })
    const previousPageResource = createResourceFixture({
      resourceId: 10,
      _id: '507f1f77bcf86cd799439030',
      name: 'Previous page resource',
      basicInfo: {
        ...createResourceFixture().basicInfo,
        resourceName: 'Previous page resource',
      },
    })
    const requestedPages: number[] = []
    let deleted = false

    server.use(
      http.get(`${apiUrl}/resources`, ({ request }) => {
        const requestedPage = Number(new URL(request.url).searchParams.get('page') ?? 1)
        requestedPages.push(requestedPage)

        if (deleted) {
          return HttpResponse.json(
            createListResponse({
              items: [previousPageResource],
              pagination: {
                page: 1,
                pageSize: 10,
                totalItems: 10,
                totalPages: 1,
              },
            }),
          )
        }

        return HttpResponse.json(
          createListResponse({
            items: [lastResource],
            pagination: {
              page: 2,
              pageSize: 10,
              totalItems: 11,
              totalPages: 2,
            },
          }),
        )
      }),
      http.delete(`${apiUrl}/resources/11`, () => {
        deleted = true
        return HttpResponse.json(lastResource)
      }),
    )

    const { user, router } = renderAppRoute(routes, '/resources?page=2')
    await screen.findByText('Last resource')
    await user.click(screen.getByRole('button', { name: 'Delete' }))
    await user.click(
      within(screen.getByRole('dialog')).getByRole('button', {
        name: 'Delete',
      }),
    )

    expect(await screen.findByText('Previous page resource')).toBeInTheDocument()
    await waitFor(() => expect(router.state.location.search).toContain('page=1'))
    await waitFor(() => expect(requestedPages).toContain(1))
  })
})
