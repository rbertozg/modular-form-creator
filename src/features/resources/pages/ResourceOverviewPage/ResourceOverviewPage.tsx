import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '../../../../design-system'
import { getErrorMessage } from '../../../../api/api-error'
import { AlertMessage } from '../../../../components/AlertMessage/AlertMessage'
import { ConfirmDialog } from '../../../../components/ConfirmDialog/ConfirmDialog'
import { ErrorState, LoadingState } from '../../../../components/PageState/PageState'
import { ResourceActionPanel } from '../../components/ResourceActionPanel/ResourceActionPanel'
import { ResourceModules } from '../../components/ResourceModules/ResourceModules'
import { ResourcePageHeader } from '../../components/ResourcePageHeader/ResourcePageHeader'
import { useResourceOverviewActions } from '../../hooks/useResourceOverviewActions'
import { useResourceWithBuffer } from '../../hooks/useResourceWithBuffer'
import { Content } from './ResourceOverviewPage.styles'

export function ResourceOverviewPage() {
  const { resourceId } = useParams()
  const navigate = useNavigate()
  const {
    bufferEntry,
    resourceQuery,
    workingResource: bufferedResource,
  } = useResourceWithBuffer(resourceId)
  const actions = useResourceOverviewActions({
    resource: resourceQuery.data,
    bufferEntry,
  })

  if (resourceQuery.isPending) {
    return <LoadingState label="Loading resource" />
  }

  if (resourceQuery.isError) {
    return (
      <ErrorState
        message={getErrorMessage(resourceQuery.error)}
        onRetry={() => void resourceQuery.refetch()}
      />
    )
  }

  const resource = resourceQuery.data
  const workingResource = bufferedResource ?? resource
  const hasBufferedChanges = Boolean(bufferEntry?.isDirty)

  return (
    <>
      <ResourcePageHeader
        resource={workingResource}
        actions={
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate(`/resources/${resource.resourceId}/details`)}
          >
            View summary
          </Button>
        }
      />
      <Content>
        {hasBufferedChanges ? (
          <AlertMessage>
            This completed resource has temporary local changes. They will be lost on
            refresh unless explicitly submitted.
          </AlertMessage>
        ) : null}
        {actions.conflictMessage ? (
          <AlertMessage tone="error">{actions.conflictMessage}</AlertMessage>
        ) : null}
        {actions.reconciliationMessage ? (
          <AlertMessage>{actions.reconciliationMessage}</AlertMessage>
        ) : null}
        {actions.mutationError ? (
          <AlertMessage tone="error">
            {getErrorMessage(actions.mutationError)}
          </AlertMessage>
        ) : null}

        <ResourceModules resource={workingResource} />
        <ResourceActionPanel
          resource={resource}
          hasBufferedChanges={hasBufferedChanges}
          isPending={actions.isPending}
          onDiscard={() => actions.openDialog('discard')}
          onProvision={() => actions.openDialog('provision')}
          onSave={() => actions.openDialog('save')}
        />
      </Content>

      <ConfirmDialog
        isOpen={actions.dialogAction !== null}
        title={actions.dialogCopy.title}
        message={actions.dialogCopy.message}
        confirmLabel={actions.dialogCopy.confirmLabel}
        isPending={actions.isPending}
        error={actions.dialogError ? getErrorMessage(actions.dialogError) : undefined}
        onCancel={actions.closeDialog}
        onConfirm={() => void actions.confirmDialog()}
      />
    </>
  )
}
