import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { PropsWithChildren } from 'react'
import { Toaster } from 'sonner'
import { ApiError } from '../api/api-error'
import { EditBufferProvider } from '../features/resources/edit-buffer/EditBufferProvider'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
          return false
        }

        return failureCount < 1
      },
    },
    mutations: {
      retry: false,
    },
  },
})

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <QueryClientProvider client={queryClient}>
      <EditBufferProvider>{children}</EditBufferProvider>
      <Toaster
        containerAriaLabel="Notifications"
        position="top-right"
        richColors
        closeButton
        toastOptions={{
          duration: 4_000,
          closeButtonAriaLabel: 'Dismiss notification',
        }}
      />
    </QueryClientProvider>
  )
}
