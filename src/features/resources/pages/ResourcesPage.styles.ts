import styled from 'styled-components'

export const Header = styled.header`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`

export const TitleGroup = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.xs};
`

export const Title = styled.h1`
  margin: 0;
  font-family: ${({ theme }) => theme.typography.heading};
`

export const Subtitle = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.inkMuted};
`

export const List = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.md};
`

export const PaginationArea = styled.div`
  margin-top: ${({ theme }) => theme.spacing.xl};
`
