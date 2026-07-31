import styled from 'styled-components'
import { Card } from '../../../../design-system'

export const FormCard = styled(Card)`
  display: grid;
  gap: ${({ theme }) => theme.spacing.lg};
  padding: ${({ theme }) => theme.spacing.xl};
`

export const LockedCard = styled(Card)`
  display: grid;
  justify-items: start;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.xl};
`

export const LockedTitle = styled.h2`
  margin: 0;
`

export const LockedText = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.inkMuted};
`
