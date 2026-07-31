import { HttpResponse, http } from 'msw'
import { screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { ProjectDetails } from '../../api/resources.types'
import { createCompleteResourceFixture } from '../../../../test/fixtures'
import { renderAppRoute } from '../../../../test/render-app'
import { server } from '../../../../test/server'
import { NotFoundPage } from '../NotFoundPage/NotFoundPage'
import { ProjectDetailsPage } from '../ProjectDetailsPage/ProjectDetailsPage'
import { ResourceDetailsPage } from '../ResourceDetailsPage/ResourceDetailsPage'

const apiUrl = 'http://localhost:5001/api'

describe('remaining resource pages', () => {
  it('saves Project Details for a draft through its module PATCH', async () => {
    const resource = createCompleteResourceFixture({ status: 'draft' })
    let submittedDetails: ProjectDetails | undefined

    server.use(
      http.get(`${apiUrl}/resources/1`, () => HttpResponse.json(resource)),
      http.patch(`${apiUrl}/resources/1/project-details`, async ({ request }) => {
        submittedDetails = (await request.json()) as ProjectDetails
        return HttpResponse.json({
          ...resource,
          projectDetails: submittedDetails,
        })
      }),
    )

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

    const budget = await screen.findByLabelText('Budget')
    await user.clear(budget)
    await user.type(budget, '25000')
    const frontEndDevelopers = screen.getByRole('checkbox', {
      name: 'FE devs',
    })
    const designer = screen.getByRole('checkbox', { name: 'Designer' })
    await user.click(frontEndDevelopers)
    await user.click(designer)
    expect(frontEndDevelopers).not.toBeChecked()
    expect(designer).toBeChecked()
    await user.click(screen.getByRole('button', { name: 'Save Project Details' }))

    await waitFor(() => expect(submittedDetails?.budget).toBe('25000'))
    expect(submittedDetails?.options).toEqual(['BE devs', 'Designer'])
    expect(
      await screen.findByRole('heading', { name: 'Resource overview' }),
    ).toBeInTheDocument()
  })

  it('renders both modules on the resource summary page', async () => {
    const resource = createCompleteResourceFixture()
    server.use(http.get(`${apiUrl}/resources/1`, () => HttpResponse.json(resource)))

    renderAppRoute(
      [
        {
          path: '/resources/:resourceId/details',
          element: <ResourceDetailsPage />,
        },
      ],
      '/resources/1/details',
    )

    expect(
      await screen.findByRole('heading', { name: 'Resource summary' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Jane Doe')).toBeInTheDocument()
    expect(screen.getByText('FE devs, BE devs')).toBeInTheDocument()
  })

  it('provides a safe route back from a missing page', async () => {
    const { user, router } = renderAppRoute(
      [
        { path: '/missing', element: <NotFoundPage /> },
        { path: '/resources', element: <h1>Resources home</h1> },
      ],
      '/missing',
    )

    await user.click(screen.getByRole('button', { name: 'Return to resources' }))

    expect(router.state.location.pathname).toBe('/resources')
  })
})
