import { Button } from '../../../design-system'
import { AlertMessage } from '../../../components/AlertMessage'
import { getErrorMessage } from '../../../api/api-error'
import { Actions } from './FormLayout.styles'

export function FormActions({
  isPending,
  submitLabel,
  onCancel,
}: {
  isPending: boolean
  submitLabel: string
  onCancel: () => void
}) {
  return (
    <Actions>
      <Button type="button" variant="secondary" disabled={isPending} onClick={onCancel}>
        Cancel
      </Button>
      <Button type="submit" disabled={isPending}>
        {isPending ? 'Saving…' : submitLabel}
      </Button>
    </Actions>
  )
}

export function FormError({ error }: { error: unknown }) {
  return error ? <AlertMessage tone="error">{getErrorMessage(error)}</AlertMessage> : null
}
