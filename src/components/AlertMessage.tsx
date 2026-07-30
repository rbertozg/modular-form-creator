import styled from 'styled-components'
import type { ReactNode } from 'react'

interface AlertMessageProps {
  children: ReactNode
  tone?: 'error' | 'info' | 'success'
}

const Alert = styled.div<{ $tone: NonNullable<AlertMessageProps['tone']> }>`
  padding: ${({ theme }) => theme.spacing.md};
  border: 1px solid
    ${({ theme, $tone }) =>
      $tone === 'error'
        ? theme.colors.warning
        : $tone === 'success'
          ? theme.colors.success
          : theme.colors.info};
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.inkStrong};
`

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
