import styled from 'styled-components'

export const Wrapper = styled.nav`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.md};
`

export const Label = styled.span`
  color: ${({ theme }) => theme.colors.inkMuted};
`
