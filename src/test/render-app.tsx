import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RouterProvider, createMemoryRouter, type RouteObject } from 'react-router-dom'
import { ThemeProvider } from 'styled-components'
import { EditBufferProvider } from '../features/resources/edit-buffer/EditBufferProvider'
import { theme } from '../design-system/theme/theme'

export function renderAppRoute(routes: RouteObject[], initialEntry: string) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: 0 },
      mutations: { retry: false },
    },
  })
  const router = createMemoryRouter(routes, {
    initialEntries: [initialEntry],
  })

  return {
    user: userEvent.setup(),
    router,
    queryClient,
    ...render(
      <ThemeProvider theme={theme}>
        <QueryClientProvider client={queryClient}>
          <EditBufferProvider>
            <RouterProvider router={router} />
          </EditBufferProvider>
        </QueryClientProvider>
      </ThemeProvider>,
    ),
  }
}
