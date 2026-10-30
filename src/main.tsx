import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { AppProviders } from '@/app/providers'
import { router } from '@/app/router'
import { startMocks } from '@/mocks/browser'
import '@/styles/globals.css'

async function bootstrap() {
  await startMocks()

  const rootElement = document.getElementById('root')
  if (!rootElement) throw new Error('Elemento #root não encontrado.')

  createRoot(rootElement).render(
    <StrictMode>
      <AppProviders router={router} />
    </StrictMode>,
  )
}

void bootstrap()
