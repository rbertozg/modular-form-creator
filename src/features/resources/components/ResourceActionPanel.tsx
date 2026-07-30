import { Button } from '../../../design-system'
import type { Resource } from '../api/resources.types'
import { canProvision } from '../resource.rules'
import { ActionBar, ActionButtons, ActionDescription } from './ResourceActionPanel.styles'

interface ResourceActionPanelProps {
  resource: Resource
  hasBufferedChanges: boolean
  isPending: boolean
  onDiscard: () => void
  onProvision: () => void
  onSave: () => void
}

export function ResourceActionPanel({
  resource,
  hasBufferedChanges,
  isPending,
  onDiscard,
  onProvision,
  onSave,
}: ResourceActionPanelProps) {
  return (
    <ActionBar>
      <ActionDescription>
        {resource.status === 'draft'
          ? canProvision(resource)
            ? 'Both modules are complete. The resource is ready for provisioning.'
            : 'Complete both modules before provisioning this resource.'
          : hasBufferedChanges
            ? 'Review and submit the buffered edits, or discard them to restore server data.'
            : 'This resource is completed. Module edits will be buffered locally until submitted.'}
      </ActionDescription>
      <ActionButtons>
        {resource.status === 'draft' ? (
          <Button
            type="button"
            disabled={!canProvision(resource) || isPending}
            onClick={onProvision}
          >
            Complete resource
          </Button>
        ) : hasBufferedChanges ? (
          <>
            <Button
              type="button"
              variant="secondary"
              disabled={isPending}
              onClick={onDiscard}
            >
              Discard changes
            </Button>
            <Button type="button" disabled={isPending} onClick={onSave}>
              Submit all changes
            </Button>
          </>
        ) : null}
      </ActionButtons>
    </ActionBar>
  )
}
