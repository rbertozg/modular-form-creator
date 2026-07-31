import { HttpResponse, http } from 'msw'
import { act, fireEvent, screen, waitFor, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { BasicInfo } from '../../api/resources.types'
import { createCompleteResourceFixture } from '../../../../test/fixtures'
import { renderAppRoute } from '../../../../test/render-app'
import { server } from '../../../../test/server'
import { BasicInfoPage } from '../BasicInfoPage/BasicInfoPage'
import { ProjectDetailsPage } from '../ProjectDetailsPage/ProjectDetailsPage'
import { ResourceOverviewPage } from '../ResourceOverviewPage/ResourceOverviewPage'

const apiUrl = 'http://localhost:5001/api'
const routes = [
  {
    path: '/resources/:resourceId/basic-info',
    element: <BasicInfoPage />,
  },
  {
    path: '/resources/:resourceId',
    element: <h1>Resource overview</h1>,
  },
]

function dispatchBeforeUnload(): Event {
  const event = new Event('beforeunload', { cancelable: true })
  window.dispatchEvent(event)
  return event
}

describe('unsaved module form navigation', () => {
  it('keeps dirty values when navigation is cancelled and discards them only after confirmation', async () => {
    const resource = createCompleteResourceFixture({ status: 'draft' })
    server.use(http.get(`${apiUrl}/resources/1`, () => HttpResponse.json(resource)))

    const { router, user } = renderAppRoute(routes, '/resources/1/basic-info')
    const ownerInput = await screen.findByLabelText('Owner')

    expect(dispatchBeforeUnload().defaultPrevented).toBe(false)
    await user.clear(ownerInput)
    await user.type(ownerInput, 'John Doe')
    expect(dispatchBeforeUnload().defaultPrevented).toBe(true)

    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    const dialog = await screen.findByRole('dialog', {
      name: 'Discard unsaved form changes?',
    })

    expect(router.state.location.pathname).toBe('/resources/1/basic-info')
    await user.click(within(dialog).getByRole('button', { name: 'Keep editing' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(ownerInput).toHaveValue('John Doe')

    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    await user.click(
      within(
        await screen.findByRole('dialog', {
          name: 'Discard unsaved form changes?',
        }),
      ).getByRole('button', { name: 'Discard and leave' }),
    )

    expect(
      await screen.findByRole('heading', { name: 'Resource overview' }),
    ).toBeInTheDocument()
  })

  it('submits a draft and navigates without a false discard prompt', async () => {
    const resource = createCompleteResourceFixture({ status: 'draft' })
    let submittedBasicInfo: BasicInfo | undefined

    server.use(
      http.get(`${apiUrl}/resources/1`, () => HttpResponse.json(resource)),
      http.patch(`${apiUrl}/resources/1/basic-info`, async ({ request }) => {
        submittedBasicInfo = (await request.json()) as BasicInfo
        return HttpResponse.json({
          ...resource,
          basicInfo: submittedBasicInfo,
        })
      }),
    )

    const { user } = renderAppRoute(routes, '/resources/1/basic-info')
    const ownerInput = await screen.findByLabelText('Owner')
    fireEvent.change(screen.getByLabelText('Resource name'), {
      target: { value: 'Manipulated name' },
    })
    await user.clear(ownerInput)
    await user.type(ownerInput, 'John Doe')
    await user.click(screen.getByRole('button', { name: 'Save Basic Info' }))

    expect(
      await screen.findByRole('heading', { name: 'Resource overview' }),
    ).toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(submittedBasicInfo).toEqual({
      ...resource.basicInfo,
      resourceName: resource.name,
      owner: 'John Doe',
    })
  })

  it('keeps failed draft edits dirty and displays the API error', async () => {
    const resource = createCompleteResourceFixture({ status: 'draft' })
    server.use(
      http.get(`${apiUrl}/resources/1`, () => HttpResponse.json(resource)),
      http.patch(`${apiUrl}/resources/1/basic-info`, () =>
        HttpResponse.json({ message: 'Basic Info could not be saved' }, { status: 500 }),
      ),
    )

    const { user } = renderAppRoute(routes, '/resources/1/basic-info')
    const ownerInput = await screen.findByLabelText('Owner')
    await user.clear(ownerInput)
    await user.type(ownerInput, 'Unsaved Owner')
    await user.click(screen.getByRole('button', { name: 'Save Basic Info' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Basic Info could not be saved',
    )
    expect(ownerInput).toHaveValue('Unsaved Owner')

    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(
      await screen.findByRole('dialog', {
        name: 'Discard unsaved form changes?',
      }),
    ).toBeInTheDocument()
  })

  it('protects Project Details changes controlled by React Hook Form', async () => {
    const resource = createCompleteResourceFixture({ status: 'draft' })
    server.use(http.get(`${apiUrl}/resources/1`, () => HttpResponse.json(resource)))

    const { user } = renderAppRoute(
      [
        {
          path: '/resources/:resourceId/project-details',
          element: <ProjectDetailsPage />,
        },
        {
          path: '/resources/:resourceId',
          element: <h1>Resource overview</h1>,
        },
      ],
      '/resources/1/project-details',
    )
    const designer = await screen.findByRole('checkbox', {
      name: 'Designer',
    })
    await user.click(designer)
    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    const dialog = await screen.findByRole('dialog', {
      name: 'Discard unsaved form changes?',
    })
    await user.click(within(dialog).getByRole('button', { name: 'Keep editing' }))

    expect(designer).toBeChecked()
    expect(screen.getByRole('heading', { name: 'Project Details' })).toBeInTheDocument()
  })

  it('finishes a pending save without racing a blocked navigation', async () => {
    const resource = createCompleteResourceFixture({ status: 'draft' })
    let releasePatch: () => void = () => undefined
    const patchGate = new Promise<void>((resolve) => {
      releasePatch = () => resolve()
    })

    server.use(
      http.get(`${apiUrl}/resources/1`, () => HttpResponse.json(resource)),
      http.patch(`${apiUrl}/resources/1/basic-info`, async ({ request }) => {
        const basicInfo = (await request.json()) as BasicInfo
        await patchGate
        return HttpResponse.json({
          ...resource,
          basicInfo,
        })
      }),
    )

    const { user } = renderAppRoute(routes, '/resources/1/basic-info')
    const ownerInput = await screen.findByLabelText('Owner')
    await user.clear(ownerInput)
    await user.type(ownerInput, 'Saved Owner')
    await user.click(screen.getByRole('button', { name: 'Save Basic Info' }))
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /Saving/ })).toBeDisabled(),
    )

    await user.click(
      screen.getByRole('link', {
        name: /Back to resource overview/,
      }),
    )
    const dialog = await screen.findByRole('dialog', {
      name: 'Discard unsaved form changes?',
    })
    expect(
      within(dialog).getByRole('button', {
        name: 'Discard and leave',
      }),
    ).toBeDisabled()
    expect(within(dialog).getByText(/save is in progress/i)).toBeInTheDocument()

    await act(async () => {
      releasePatch()
    })

    expect(
      await screen.findByRole('heading', { name: 'Resource overview' }),
    ).toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('allows SPA navigation after completed edits enter the global buffer', async () => {
    const resource = createCompleteResourceFixture()
    server.use(http.get(`${apiUrl}/resources/1`, () => HttpResponse.json(resource)))

    const { user } = renderAppRoute(
      [
        {
          path: '/resources/:resourceId/basic-info',
          element: <BasicInfoPage />,
        },
        {
          path: '/resources/:resourceId',
          element: <ResourceOverviewPage />,
        },
      ],
      '/resources/1/basic-info',
    )
    const ownerInput = await screen.findByLabelText('Owner')
    await user.clear(ownerInput)
    await user.type(ownerInput, 'Local Owner')
    await user.click(screen.getByRole('button', { name: 'Keep changes locally' }))

    expect(await screen.findByText(/temporary local changes/i)).toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(dispatchBeforeUnload().defaultPrevented).toBe(true)

    await user.click(screen.getAllByRole('link', { name: /Review module/ })[0])
    expect(await screen.findByLabelText('Owner')).toHaveValue('Local Owner')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
