import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from '@tanstack/react-router'

import { queryClient } from '@/app/query-client'
import type { router } from '@/app/router'

interface AppProvidersProps {
  router: typeof router
}

export function AppProviders({ router: appRouter }: AppProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={appRouter} />
    </QueryClientProvider>
  )
}

