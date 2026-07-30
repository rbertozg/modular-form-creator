import styled from 'styled-components'
import { Button, Card } from '../design-system'
import { AlertMessage } from './AlertMessage'

const StateCard = styled(Card)`
  display: grid;
  justify-items: start;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.xl};
`

const Title = styled.h2`
  margin: 0;
`

const Description = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.inkMuted};
`

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
