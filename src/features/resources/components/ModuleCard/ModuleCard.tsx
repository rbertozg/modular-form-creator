import { Badge } from '../../../../design-system'
import {
  ActionLink,
  Description,
  Header,
  LockedText,
  Module,
  Title,
} from './ModuleCard.styles'

interface ModuleCardProps {
  title: string
  description: string
  isComplete: boolean
  isLocked?: boolean
  to: string
}

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
