import styled from 'styled-components'

export const Filters = styled.div`
  display: grid;
  grid-template-columns: minmax(220px, 1fr) repeat(2, minmax(150px, 220px));
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.lg};

  @media (max-width: 760px) {
    grid-template-columns: 1fr;
  }
`
