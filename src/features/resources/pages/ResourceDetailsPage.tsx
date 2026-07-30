import { useParams } from 'react-router-dom'
import styled from 'styled-components'
import { Card } from '../../../design-system'
import { getErrorMessage } from '../../../api/api-error'
import { AlertMessage } from '../../../components/AlertMessage'
import { ErrorState, LoadingState } from '../../../components/PageState'
import { ResourcePageHeader } from '../components/ResourcePageHeader'
import { useResourceWithBuffer } from '../hooks/useResourceWithBuffer'

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};

  @media (max-width: 760px) {
    grid-template-columns: 1fr;
  }
`

const SummaryCard = styled(Card)`
  padding: ${({ theme }) => theme.spacing.lg};
`

const Heading = styled.h2`
  margin: 0 0 ${({ theme }) => theme.spacing.lg};
`

const Details = styled.dl`
  display: grid;
  grid-template-columns: minmax(120px, auto) 1fr;
  gap: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  margin: 0;

  dt {
    color: ${({ theme }) => theme.colors.inkMuted};
    font-weight: 600;
  }

  dd {
    min-width: 0;
    margin: 0;
    overflow-wrap: anywhere;
  }
`

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
