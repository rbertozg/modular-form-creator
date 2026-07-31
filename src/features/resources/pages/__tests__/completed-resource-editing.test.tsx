import { HttpResponse, http } from 'msw'
import { screen, waitFor, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { Resource, ResourcePayload } from '../../api/resources.types'
import { createCompleteResourceFixture } from '../../../../test/fixtures'
import { renderAppRoute } from '../../../../test/render-app'
import { server } from '../../../../test/server'
import { BasicInfoPage } from '../BasicInfoPage/BasicInfoPage'
import { ResourceOverviewPage } from '../ResourceOverviewPage/ResourceOverviewPage'

const apiUrl = 'http://localhost:5001/api'
const routes = [
  {
    path: '/resources/:resourceId',
    element: <ResourceOverviewPage />,
  },
  {
    path: '/resources/:resourceId/basic-info',
    element: <BasicInfoPage />,
  },
]

describe('completed resource editing', () => {
  it('keeps edits local until the full update is submitted', async () => {
    const resource = createCompleteResourceFixture()
    let basicInfoPatchRequests = 0
    let submittedPayload: ResourcePayload | undefined

    server.use(
      http.get(`${apiUrl}/resources/1`, () => HttpResponse.json(resource)),
      http.patch(`${apiUrl}/resources/1/basic-info`, () => {
        basicInfoPatchRequests += 1
        return HttpResponse.json(resource)
      }),
      http.put(`${apiUrl}/resources/1`, async ({ request }) => {
        submittedPayload = (await request.json()) as ResourcePayload
        return HttpResponse.json({
          ...resource,
          basicInfo: submittedPayload.basicInfo,
        })
      }),
    )

    const { user } = renderAppRoute(routes, '/resources/1/basic-info')
    expect(
      await screen.findByText(/saving this form keeps changes only/i),
    ).toBeInTheDocument()
    const ownerInput = await screen.findByLabelText('Owner')
    await user.clear(ownerInput)
    await user.type(ownerInput, 'John Doe')
    await user.click(screen.getByRole('button', { name: 'Keep changes locally' }))

    expect(await screen.findByText(/temporary local changes/i)).toBeInTheDocument()
    expect(basicInfoPatchRequests).toBe(0)
    expect(submittedPayload).toBeUndefined()

    await user.click(screen.getByRole('button', { name: 'Submit all changes' }))
    await user.click(
      within(screen.getByRole('dialog')).getByRole('button', {
        name: 'Submit changes',
      }),
    )

    await waitFor(() => expect(submittedPayload?.basicInfo.owner).toBe('John Doe'))
    expect(submittedPayload).toEqual({
      name: resource.name,
      basicInfo: {
        ...resource.basicInfo,
        owner: 'John Doe',
      },
      projectDetails: resource.projectDetails,
    })
    expect(basicInfoPatchRequests).toBe(0)
    await waitFor(() =>
      expect(screen.queryByText(/temporary local changes/i)).not.toBeInTheDocument(),
    )
  })

  it('reconciles a completed update that returns an invalid response', async () => {
    const resource = createCompleteResourceFixture()
    let serverResource = resource
    let replaceRequests = 0

    server.use(
      http.get(`${apiUrl}/resources/1`, () => HttpResponse.json(serverResource)),
      http.put(`${apiUrl}/resources/1`, async ({ request }) => {
        const payload = (await request.json()) as ResourcePayload
        replaceRequests += 1
        serverResource = {
          ...resource,
          name: payload.name,
          basicInfo: payload.basicInfo,
          projectDetails: payload.projectDetails,
          updatedAt: '2026-07-30T12:00:00.000Z',
        }
        return HttpResponse.json({ resourceId: resource.resourceId })
      }),
    )

    const { user } = renderAppRoute(routes, '/resources/1/basic-info')
    const ownerInput = await screen.findByLabelText('Owner')
    await user.clear(ownerInput)
    await user.type(ownerInput, 'Reconciled Owner')
    await user.click(screen.getByRole('button', { name: 'Keep changes locally' }))
    await user.click(
      await screen.findByRole('button', {
        name: 'Submit all changes',
      }),
    )
    await user.click(
      within(screen.getByRole('dialog')).getByRole('button', {
        name: 'Submit changes',
      }),
    )

    expect(
      await screen.findByText(/buffered changes were saved on the server/i),
    ).toBeInTheDocument()
    expect(replaceRequests).toBe(1)
    expect(screen.queryByText(/temporary local changes/i)).not.toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it.each([
    {
      caseName: 'a matching draft',
      createServerResource: (resource: Resource, payload: ResourcePayload): Resource => ({
        ...resource,
        ...payload,
        status: 'draft',
      }),
    },
    {
      caseName: 'an inconsistent immutable name',
      createServerResource: (resource: Resource, payload: ResourcePayload): Resource => ({
        ...resource,
        ...payload,
        basicInfo: {
          ...payload.basicInfo,
          resourceName: 'Inconsistent resource name',
        },
      }),
    },
  ])(
    'does not reconcile a completed update from $caseName',
    async ({ createServerResource }) => {
      const resource = createCompleteResourceFixture()
      let serverResource = resource

      server.use(
        http.get(`${apiUrl}/resources/1`, () => HttpResponse.json(serverResource)),
        http.put(`${apiUrl}/resources/1`, async ({ request }) => {
          const payload = (await request.json()) as ResourcePayload
          serverResource = createServerResource(resource, payload)
          return HttpResponse.json({
            resourceId: resource.resourceId,
          })
        }),
      )

      const { user } = renderAppRoute(routes, '/resources/1/basic-info')
      const ownerInput = await screen.findByLabelText('Owner')
      await user.clear(ownerInput)
      await user.type(ownerInput, 'Unconfirmed Owner')
      await user.click(
        screen.getByRole('button', {
          name: 'Keep changes locally',
        }),
      )
      await user.click(
        await screen.findByRole('button', {
          name: 'Submit all changes',
        }),
      )

      const dialog = screen.getByRole('dialog', {
        name: 'Submit all buffered changes?',
      })
      await user.click(
        within(dialog).getByRole('button', {
          name: 'Submit changes',
        }),
      )

      expect(await within(dialog).findByRole('alert')).toHaveTextContent(
        'invalid resource response',
      )
      expect(
        await within(dialog).findByRole('button', {
          name: 'Submit changes',
        }),
      ).toBeEnabled()
      expect(screen.getByText(/temporary local changes/i)).toBeInTheDocument()
    },
  )

  it('keeps the buffer and dialog when a completed update is not confirmed', async () => {
    const resource = createCompleteResourceFixture()

    server.use(
      http.get(`${apiUrl}/resources/1`, () => HttpResponse.json(resource)),
      http.put(`${apiUrl}/resources/1`, () =>
        HttpResponse.json({ message: 'Full update failed' }, { status: 500 }),
      ),
    )

    const { user } = renderAppRoute(routes, '/resources/1/basic-info')
    const ownerInput = await screen.findByLabelText('Owner')
    await user.clear(ownerInput)
    await user.type(ownerInput, 'Unsaved Owner')
    await user.click(screen.getByRole('button', { name: 'Keep changes locally' }))
    await user.click(
      await screen.findByRole('button', {
        name: 'Submit all changes',
      }),
    )

    const dialog = screen.getByRole('dialog', {
      name: 'Submit all buffered changes?',
    })
    await user.click(
      within(dialog).getByRole('button', {
        name: 'Submit changes',
      }),
    )

    expect(await within(dialog).findByRole('alert')).toHaveTextContent(
      'Full update failed',
    )
    expect(
      await within(dialog).findByRole('button', {
        name: 'Submit changes',
      }),
    ).toBeEnabled()
    expect(screen.getByText(/temporary local changes/i)).toBeInTheDocument()
  })

  it('loses edits after a full provider remount', async () => {
    const resource = createCompleteResourceFixture()
    server.use(http.get(`${apiUrl}/resources/1`, () => HttpResponse.json(resource)))

    const firstRender = renderAppRoute(routes, '/resources/1/basic-info')
    const ownerInput = await screen.findByLabelText('Owner')
    await firstRender.user.clear(ownerInput)
    await firstRender.user.type(ownerInput, 'Temporary Owner')
    await firstRender.user.click(
      screen.getByRole('button', { name: 'Keep changes locally' }),
    )
    expect(await screen.findByText(/temporary local changes/i)).toBeInTheDocument()

    firstRender.unmount()
    const secondRender = renderAppRoute(routes, '/resources/1/basic-info')

    expect(await screen.findByLabelText('Owner')).toHaveValue('Jane Doe')
    expect(screen.queryByText(/temporary local changes/i)).not.toBeInTheDocument()
    secondRender.unmount()
  })

  it('keeps the buffer and skips PUT when updatedAt has changed', async () => {
    const resource = createCompleteResourceFixture()
    let serverResource = resource
    let replaceRequests = 0

    server.use(
      http.get(`${apiUrl}/resources/1`, () => HttpResponse.json(serverResource)),
      http.put(`${apiUrl}/resources/1`, () => {
        replaceRequests += 1
        return HttpResponse.json(serverResource)
      }),
    )

    const { user } = renderAppRoute(routes, '/resources/1/basic-info')
    const ownerInput = await screen.findByLabelText('Owner')
    await user.clear(ownerInput)
    await user.type(ownerInput, 'Temporary Owner')
    await user.click(screen.getByRole('button', { name: 'Keep changes locally' }))
    expect(await screen.findByText(/temporary local changes/i)).toBeInTheDocument()

    serverResource = {
      ...resource,
      updatedAt: '2026-07-30T12:00:00.000Z',
    }
    await user.click(screen.getByRole('button', { name: 'Submit all changes' }))
    await user.click(
      within(screen.getByRole('dialog')).getByRole('button', {
        name: 'Submit changes',
      }),
    )

    expect(
      await screen.findByText(/changed on the server after editing began/i),
    ).toBeInTheDocument()
    expect(replaceRequests).toBe(0)
    expect(screen.getByText(/temporary local changes/i)).toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
