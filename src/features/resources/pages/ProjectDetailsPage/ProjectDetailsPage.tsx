import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '../../../../design-system'
import type { ProjectDetails } from '../../api/resources.types'
import { getErrorMessage } from '../../../../api/api-error'
import { ErrorState, LoadingState } from '../../../../components/PageState/PageState'
import { CompletedEditNotice } from '../../components/CompletedEditNotice'
import { ResourcePageHeader } from '../../components/ResourcePageHeader/ResourcePageHeader'
import { canAccessProjectDetails } from '../../domain/resource.rules'
import { ProjectDetailsForm } from '../../forms/ProjectDetailsForm'
import { useResourceWithBuffer } from '../../hooks/useResourceWithBuffer'
import { useUpdateProjectDetails } from '../../resource.queries'
import {
  FormCard,
  LockedCard,
  LockedText,
  LockedTitle,
} from './ProjectDetailsPage.styles'

export function ProjectDetailsPage() {
  const { resourceId } = useParams()
  const navigate = useNavigate()
  const { bufferEntry, editBuffer, resourceQuery } = useResourceWithBuffer(resourceId)
  const updateMutation = useUpdateProjectDetails()

  if (resourceQuery.isPending) {
    return <LoadingState label="Loading Project Details" />
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
  const overviewPath = `/resources/${resource.resourceId}`
  const isLocked = !canAccessProjectDetails(resource)

  if (isLocked) {
    return (
      <>
        <ResourcePageHeader
          resource={resource}
          title="Project Details"
          subtitle={resource.name}
          backTo={overviewPath}
          backLabel="← Back to resource overview"
        />
        <LockedCard>
          <LockedTitle>Project Details is locked</LockedTitle>
          <LockedText>
            Complete and save Basic Info before opening this module.
          </LockedText>
          <Button
            type="button"
            onClick={() => navigate(`/resources/${resource.resourceId}/basic-info`)}
          >
            Complete Basic Info
          </Button>
        </LockedCard>
      </>
    )
  }

  const values = bufferEntry?.payload.projectDetails ?? resource.projectDetails

  const handleSubmit = async (projectDetails: ProjectDetails) => {
    if (resource.status === 'completed') {
      editBuffer.updateProjectDetails(resource, projectDetails)
      toast.info('Project Details changes kept locally', {
        description: 'Submit all changes from the resource overview to persist them.',
      })
      return
    }

    await updateMutation.mutateAsync({
      resourceId: String(resource.resourceId),
      projectDetails,
    })
    toast.success('Project Details saved')
  }

  return (
    <>
      <ResourcePageHeader
        resource={resource}
        title="Project Details"
        subtitle={resource.name}
        backTo={overviewPath}
        backLabel="← Back to resource overview"
      />
      <FormCard>
        {resource.status === 'completed' ? <CompletedEditNotice /> : null}
        <ProjectDetailsForm
          defaultValues={values}
          isPending={updateMutation.isPending}
          error={updateMutation.error}
          submitLabel={
            resource.status === 'completed'
              ? 'Keep changes locally'
              : 'Save Project Details'
          }
          onCancel={() => navigate(overviewPath)}
          onSubmit={handleSubmit}
          onSubmitSuccess={() => navigate(overviewPath)}
        />
      </FormCard>
    </>
  )
}
