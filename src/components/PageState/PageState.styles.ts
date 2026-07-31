import styled from 'styled-components'
import { Card } from '../../design-system'

export const StateCard = styled(Card)`
  display: grid;
  justify-items: start;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.xl};
`

export const Title = styled.h2`
  margin: 0;
`

export const Description = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.inkMuted};
`
