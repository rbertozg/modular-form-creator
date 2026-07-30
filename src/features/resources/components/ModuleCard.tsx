import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { Badge, Card } from '../../../design-system'

interface ModuleCardProps {
  title: string
  description: string
  isComplete: boolean
  isLocked?: boolean
  to: string
}

const Module = styled(Card)`
  display: grid;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.lg};
`

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.md};
`

const Title = styled.h2`
  margin: 0;
  font-size: 1.15rem;
`

const Description = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.inkMuted};
`

const ActionLink = styled(Link)`
  width: fit-content;
  color: ${({ theme }) => theme.colors.primaryStrong};
  font-weight: 700;
`

const LockedText = styled.span`
  color: ${({ theme }) => theme.colors.inkMuted};
  font-weight: 600;
`

export function ModuleCard({
  title,
  description,
  isComplete,
  isLocked = false,
  to,
}: ModuleCardProps) {
  return (
    <Module>
      <Header>
        <Title>{title}</Title>
        <Badge variant={isLocked ? 'neutral' : isComplete ? 'success' : 'warning'}>
          {isLocked ? 'Locked' : isComplete ? 'Complete' : 'Incomplete'}
        </Badge>
      </Header>
      <Description>{description}</Description>
      {isLocked ? (
        <LockedText>Complete Basic Info to unlock this module.</LockedText>
      ) : (
        <ActionLink to={to}>
          {isComplete ? 'Review module' : 'Complete module'} →
        </ActionLink>
      )}
    </Module>
  )
}
