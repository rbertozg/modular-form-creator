import { useParams } from 'react-router-dom'
import { getErrorMessage } from '../../../../api/api-error'
import { AlertMessage } from '../../../../components/AlertMessage/AlertMessage'
import { ErrorState, LoadingState } from '../../../../components/PageState/PageState'
import { ResourcePageHeader } from '../../components/ResourcePageHeader/ResourcePageHeader'
import { useResourceWithBuffer } from '../../hooks/useResourceWithBuffer'
import { Details, Grid, Heading, SummaryCard } from './ResourceDetailsPage.styles'

function display(value: string): string {
  return value || '—'
}

export function ResourceDetailsPage() {
  const { resourceId } = useParams()
  const {
    bufferEntry,
    resourceQuery,
    workingResource: bufferedResource,
  } = useResourceWithBuffer(resourceId)

  if (resourceQuery.isPending) {
    return <LoadingState label="Loading resource summary" />
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
  const overviewPath = `/resources/${resource.resourceId}`

  return (
    <>
      <ResourcePageHeader
        resource={workingResource}
        title="Resource summary"
        subtitle={resource.name}
        backTo={overviewPath}
        backLabel="← Back to resource overview"
      />
      {bufferEntry?.isDirty ? (
        <AlertMessage>
          This summary includes temporary local edits that have not been submitted to the
          backend.
        </AlertMessage>
      ) : null}
      <Grid>
        <SummaryCard>
          <Heading>Basic Info</Heading>
          <Details>
            <dt>Resource name</dt>
            <dd>{display(workingResource.basicInfo.resourceName)}</dd>
            <dt>Owner</dt>
            <dd>{display(workingResource.basicInfo.owner)}</dd>
            <dt>Email</dt>
            <dd>{display(workingResource.basicInfo.email)}</dd>
            <dt>Priority</dt>
            <dd>{display(workingResource.basicInfo.priority)}</dd>
            <dt>Description</dt>
            <dd>{display(workingResource.basicInfo.description)}</dd>
          </Details>
        </SummaryCard>
        <SummaryCard>
          <Heading>Project Details</Heading>
          <Details>
            <dt>Project name</dt>
            <dd>{display(workingResource.projectDetails.projectName)}</dd>
            <dt>Budget</dt>
            <dd>{display(workingResource.projectDetails.budget)}</dd>
            <dt>Category</dt>
            <dd>{display(workingResource.projectDetails.category)}</dd>
            <dt>Team</dt>
            <dd>
              {workingResource.projectDetails.options.length
                ? workingResource.projectDetails.options.join(', ')
                : '—'}
            </dd>
          </Details>
        </SummaryCard>
      </Grid>
    </>
  )
}
