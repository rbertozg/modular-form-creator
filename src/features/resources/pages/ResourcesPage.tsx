import { Button } from '../../../design-system'
import { getErrorMessage } from '../../../api/api-error'
import { AlertMessage } from '../../../components/AlertMessage'
import { ConfirmDialog } from '../../../components/ConfirmDialog'
import { EmptyState, ErrorState, LoadingState } from '../../../components/PageState'
import { BufferedChangesPanel } from '../components/BufferedChangesPanel'
import { CreateResourceDrawer } from '../components/CreateResourceDrawer'
import { Pagination } from '../components/Pagination'
import { ResourceFilters } from '../components/ResourceFilters'
import { ResourceListItem } from '../components/ResourceListItem'
import { useEditBuffer } from '../edit-buffer/useEditBuffer'
import { useResourceListActions } from '../hooks/useResourceListActions'
import { useResourceListParams } from '../hooks/useResourceListParams'
import { useResources } from '../resource.queries'
import {
  Header,
  List,
  PaginationArea,
  Subtitle,
  Title,
  TitleGroup,
} from './ResourcesPage.styles'

export function ResourcesPage() {
  const listParams = useResourceListParams()
  const editBuffer = useEditBuffer()
  const resourcesQuery = useResources(listParams.queryParams)
  const actions = useResourceListActions({
    itemCount: resourcesQuery.data?.items.length ?? 0,
    page: listParams.page,
    moveToPreviousPage: listParams.moveToPreviousPage,
    refetchResources: resourcesQuery.refetch,
  })

  return (
    <>
      <Header>
        <TitleGroup>
          <Title>Resources</Title>
          <Subtitle>Create resources and track their module progress.</Subtitle>
        </TitleGroup>
        <Button type="button" onClick={actions.openCreate}>
          Create resource
        </Button>
      </Header>

      <BufferedChangesPanel resources={editBuffer.dirtyResources} />

      {actions.reconciliationMessage ? (
        <AlertMessage>{actions.reconciliationMessage}</AlertMessage>
      ) : null}

      <ResourceFilters
        name={listParams.name}
        status={listParams.status}
        sortOrder={listParams.sortOrder}
        onNameChange={listParams.setName}
        onStatusChange={listParams.setStatus}
        onSortOrderChange={listParams.setSortOrder}
      />

      {actions.deleteMutation.error ? (
        <AlertMessage tone="error">
          {getErrorMessage(actions.deleteMutation.error)}
        </AlertMessage>
      ) : null}

      {resourcesQuery.isPending ? (
        <LoadingState label="Loading resources" />
      ) : resourcesQuery.isError ? (
        <ErrorState
          message={getErrorMessage(resourcesQuery.error)}
          onRetry={() => void resourcesQuery.refetch()}
        />
      ) : resourcesQuery.data.items.length === 0 ? (
        <EmptyState
          title="No resources found"
          description={
            listParams.name || listParams.status
              ? 'Try changing the active filters.'
              : 'Create the first resource to begin provisioning.'
          }
        />
      ) : (
        <>
          <List>
            {resourcesQuery.data.items.map((resource) => (
              <ResourceListItem
                key={resource._id}
                resource={resource}
                hasUnsavedChanges={
                  resource.status === 'completed' &&
                  Boolean(editBuffer.getEntry(resource.resourceId)?.isDirty)
                }
                onDelete={actions.requestDelete}
              />
            ))}
          </List>
          <PaginationArea>
            <Pagination
              page={resourcesQuery.data.pagination.page}
              totalPages={resourcesQuery.data.pagination.totalPages}
              onChange={listParams.setPage}
            />
          </PaginationArea>
        </>
      )}

      <CreateResourceDrawer
        isOpen={actions.isCreateOpen}
        isPending={actions.createMutation.isPending}
        error={actions.createMutation.error}
        onClose={actions.closeCreate}
        onSubmit={actions.create}
      />

      <ConfirmDialog
        isOpen={Boolean(actions.resourceToDelete)}
        title="Delete resource?"
        message={
          actions.resourceToDelete
            ? `“${actions.resourceToDelete.name}” will be permanently deleted.`
            : ''
        }
        confirmLabel="Delete"
        isPending={actions.isDeletePending}
        error={
          actions.deleteMutation.error
            ? getErrorMessage(actions.deleteMutation.error)
            : undefined
        }
        onCancel={actions.cancelDelete}
        onConfirm={actions.confirmDelete}
      />
    </>
  )
}
