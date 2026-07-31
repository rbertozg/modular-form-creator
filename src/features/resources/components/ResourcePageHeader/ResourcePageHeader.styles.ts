import { Link } from 'react-router-dom'
import styled from 'styled-components'

export const Header = styled.header`
  display: grid;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`

export const BackLink = styled(Link)`
  width: fit-content;
  color: ${({ theme }) => theme.colors.primaryStrong};
  font-weight: 600;
`

export const MainRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.lg};

  @media (max-width: 680px) {
    flex-direction: column;
  }
`

export const TitleGroup = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.xs};
`

export const TitleRow = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm};
`

export const Title = styled.h1`
  margin: 0;
  font-family: ${({ theme }) => theme.typography.heading};
`

export const Subtitle = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.inkMuted};
`

export const Actions = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm};
`
