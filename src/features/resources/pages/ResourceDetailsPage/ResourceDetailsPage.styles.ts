import styled from 'styled-components'
import { Card } from '../../../../design-system'

export const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};

  @media (max-width: 760px) {
    grid-template-columns: 1fr;
  }
`

export const SummaryCard = styled(Card)`
  padding: ${({ theme }) => theme.spacing.lg};
`

export const Heading = styled.h2`
  margin: 0 0 ${({ theme }) => theme.spacing.lg};
`

export const Details = styled.dl`
  display: grid;
  grid-template-columns: minmax(120px, auto) 1fr;
  gap: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  margin: 0;

  dt {
    color: ${({ theme }) => theme.colors.inkMuted};
    font-weight: 600;
  }

  dd {
    min-width: 0;
    margin: 0;
    overflow-wrap: anywhere;
  }
`
