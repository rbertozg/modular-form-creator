import styled from 'styled-components'

export const ActionBar = styled.section`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.md};
  padding-top: ${({ theme }) => theme.spacing.md};
`

export const ActionDescription = styled.p`
  max-width: 680px;
  margin: 0;
  color: ${({ theme }) => theme.colors.inkMuted};
`

export const ActionButtons = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm};
`
