import { Button } from '../../design-system'
import { AlertMessage } from '../AlertMessage/AlertMessage'
import { Description, StateCard, Title } from './PageState.styles'

export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  return (
    <StateCard aria-busy="true">
      <Title>{label}</Title>
      <Description>Please wait while the latest data is loaded.</Description>
    </StateCard>
  )
}

interface ErrorStateProps {
  message: string
  onRetry?: () => void
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <StateCard>
      <AlertMessage tone="error">{message}</AlertMessage>
      {onRetry ? (
        <Button type="button" variant="secondary" onClick={onRetry}>
          Try again
        </Button>
      ) : null}
    </StateCard>
  )
}

export function EmptyState({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <StateCard>
      <Title>{title}</Title>
      <Description>{description}</Description>
    </StateCard>
  )
}
