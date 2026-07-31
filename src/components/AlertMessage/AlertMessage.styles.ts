import styled from 'styled-components'

export type AlertTone = 'error' | 'info' | 'success'

export const Alert = styled.div<{ $tone: AlertTone }>`
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
