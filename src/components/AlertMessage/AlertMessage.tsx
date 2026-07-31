import type { ReactNode } from 'react'
import { Alert, type AlertTone } from './AlertMessage.styles'

interface AlertMessageProps {
  children: ReactNode
  tone?: AlertTone
}

export function AlertMessage({ children, tone = 'info' }: AlertMessageProps) {
  return (
    <Alert
      $tone={tone}
      role={tone === 'error' ? 'alert' : 'status'}
      aria-live={tone === 'error' ? 'assertive' : 'polite'}
    >
      {children}
    </Alert>
  )
}
