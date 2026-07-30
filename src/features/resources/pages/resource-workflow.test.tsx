import { HttpResponse, http } from 'msw'
import { screen, waitFor, within } from '@testing-library/react'
import { useNavigate } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import type { Resource } from '../api/resources.types'
import {
  createCompleteResourceFixture,
  createResourceFixture,
} from '../../../test/fixtures'
import { renderAppRoute } from '../../../test/render-app'
import { server } from '../../../test/server'
import { useEditBuffer } from '../edit-buffer/useEditBuffer'
import { BasicInfoPage } from './BasicInfoPage'
import { ProjectDetailsPage } from './ProjectDetailsPage'
import { ResourceOverviewPage } from './ResourceOverviewPage'

const apiUrl = 'http://localhost:5001/api'

function SeedStaleBufferPage({ resource }: { resource: Resource }) {
  const editBuffer = useEditBuffer()
  const navigate = useNavigate()

  return (
    <button
      type="button"
      onClick={() => {
        editBuffer.updateBasicInfo(resource, {
          ...resource.basicInfo,
          owner: 'Stale Owner',
        })
        navigate('/resources/1/basic-info')
      }}
    >
      Seed stale buffer and open draft
    </button>
  )
}

describe('resource workflow', () => {
  it('blocks direct access to Project Details for an incomplete draft', async () => {
    const resource = createResourceFixture()
    server.use(http.get(`${apiUrl}/resources/1`, () => HttpResponse.json(resource)))

    renderAppRoute(
      [
        {
          path: '/resources/:resourceId/project-details',
          element: <ProjectDetailsPage />,
        },
      ],
      '/resources/1/project-details',
    )

    expect(
      await screen.findByRole('heading', {
        name: 'Project Details is locked',
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Complete Basic Info' }),
    ).toBeInTheDocument()
  })

  it('provisions a draft only after explicit confirmation', async () => {
    const draft = createCompleteResourceFixture({ status: 'draft' })
    const completed = { ...draft, status: 'completed' as const }
    let provisioningRequests = 0

    server.use(
      http.get(`${apiUrl}/resources/1`, () => HttpResponse.json(draft)),
      http.patch(`${apiUrl}/resources/1/provisioning`, () => {
        provisioningRequests += 1
        return HttpResponse.json(completed)
      }),
    )

    const { user } = renderAppRoute(
      [
        {
          path: '/resources/:resourceId',
          element: <ResourceOverviewPage />,
        },
      ],
      '/resources/1',
    )

    const completeButton = await screen.findByRole('button', {
      name: 'Complete resource',
    })
    expect(provisioningRequests).toBe(0)

    await user.click(completeButton)
    const dialog = screen.getByRole('dialog')
    await user.click(within(dialog).getByRole('button', { name: 'Complete resource' }))

    await waitFor(() => expect(provisioningRequests).toBe(1))
    expect(await screen.findByText('Completed')).toBeInTheDocument()
  })

  it('shows a provisioning failure inside the confirmation dialog', async () => {
    const draft = createCompleteResourceFixture({ status: 'draft' })
    let resourceRequests = 0

    server.use(
      http.get(`${apiUrl}/resources/1`, () => {
        resourceRequests += 1

        return resourceRequests === 1
          ? HttpResponse.json(draft)
          : HttpResponse.json({ message: 'Verification failed' }, { status: 500 })
      }),
      http.patch(`${apiUrl}/resources/1/provisioning`, () =>
        HttpResponse.json({ message: 'Provisioning failed' }, { status: 500 }),
      ),
    )

    const { user } = renderAppRoute(
      [
        {
          path: '/resources/:resourceId',
          element: <ResourceOverviewPage />,
        },
      ],
      '/resources/1',
    )

    await user.click(await screen.findByRole('button', { name: 'Complete resource' }))
    const dialog = screen.getByRole('dialog', {
      name: 'Complete this resource?',
    })
    await user.click(within(dialog).getByRole('button', { name: 'Complete resource' }))

    expect(await within(dialog).findByRole('alert')).toHaveTextContent(
      'Provisioning failed',
    )
    expect(
      await within(dialog).findByRole('button', {
        name: 'Complete resource',
      }),
    ).toBeEnabled()
    expect(resourceRequests).toBe(2)
  })

  it('reconciles server state after provisioning returns an invalid response', async () => {
    const draft = createCompleteResourceFixture({ status: 'draft' })
    const completed = { ...draft, status: 'completed' as const }
    let serverResource: Resource = draft
    let resourceRequests = 0

    server.use(
      http.get(`${apiUrl}/resources/1`, () => {
        resourceRequests += 1
        return HttpResponse.json(serverResource)
      }),
      http.patch(`${apiUrl}/resources/1/provisioning`, () => {
        serverResource = completed
        return HttpResponse.json({ status: 'completed' })
      }),
    )

    const { user } = renderAppRoute(
      [
        {
          path: '/resources/:resourceId',
          element: <ResourceOverviewPage />,
        },
      ],
      '/resources/1',
    )

    await user.click(await screen.findByRole('button', { name: 'Complete resource' }))
    await user.click(
      within(screen.getByRole('dialog')).getByRole('button', {
        name: 'Complete resource',
      }),
    )

    await waitFor(() => expect(resourceRequests).toBeGreaterThan(1))
    expect(await screen.findByText('Completed')).toBeInTheDocument()
    expect(await screen.findByText(/completed on the server/i)).toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Complete resource' }),
    ).not.toBeInTheDocument()
  })

  it('never applies a stale completed buffer to a draft reusing the same id', async () => {
    const previousResource = createCompleteResourceFixture()
    const recreatedDraft = createResourceFixture()

    server.use(http.get(`${apiUrl}/resources/1`, () => HttpResponse.json(recreatedDraft)))

    const { user } = renderAppRoute(
      [
        {
          path: '/seed',
          element: <SeedStaleBufferPage resource={previousResource} />,
        },
        {
          path: '/resources/:resourceId/basic-info',
          element: <BasicInfoPage />,
        },
      ],
      '/seed',
    )

    await user.click(
      screen.getByRole('button', {
        name: 'Seed stale buffer and open draft',
      }),
    )

    expect(await screen.findByLabelText('Owner')).toHaveValue('')
  })
})
