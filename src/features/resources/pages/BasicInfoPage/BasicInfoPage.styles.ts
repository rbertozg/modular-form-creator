import styled from 'styled-components'
import { Card } from '../../../../design-system'

export const FormCard = styled(Card)`
  display: grid;
  gap: ${({ theme }) => theme.spacing.lg};
  padding: ${({ theme }) => theme.spacing.xl};
`
