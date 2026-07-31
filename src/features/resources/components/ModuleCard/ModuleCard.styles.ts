import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { Card } from '../../../../design-system'

export const Module = styled(Card)`
  display: grid;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.lg};
`

export const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.md};
`

export const Title = styled.h2`
  margin: 0;
  font-size: 1.15rem;
`

export const Description = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.inkMuted};
`

export const ActionLink = styled(Link)`
  width: fit-content;
  color: ${({ theme }) => theme.colors.primaryStrong};
  font-weight: 700;
`

export const LockedText = styled.span`
  color: ${({ theme }) => theme.colors.inkMuted};
  font-weight: 600;
`
