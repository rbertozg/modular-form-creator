import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import styled from 'styled-components'
import { Card } from '../../../design-system'
import type { BasicInfo } from '../api/resources.types'
import { getErrorMessage } from '../../../api/api-error'
import { ErrorState, LoadingState } from '../../../components/PageState'
import { CompletedEditNotice } from '../components/CompletedEditNotice'
import { ResourcePageHeader } from '../components/ResourcePageHeader'
import { BasicInfoForm } from '../forms/BasicInfoForm'
import { useResourceWithBuffer } from '../hooks/useResourceWithBuffer'
import { toBasicInfoUpdatePayload } from '../resource.mappers'
import { useUpdateBasicInfo } from '../resource.queries'

const FormCard = styled(Card)`
  display: grid;
  gap: ${({ theme }) => theme.spacing.lg};
  padding: ${({ theme }) => theme.spacing.xl};
`

export function BasicInfoPage() {
  const { resourceId } = useParams()
  const navigate = useNavigate()
  const { bufferEntry, editBuffer, resourceQuery } = useResourceWithBuffer(resourceId)
  const updateMutation = useUpdateBasicInfo()

  if (resourceQuery.isPending) {
    return <LoadingState label="Loading Basic Info" />
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
  const values = bufferEntry?.payload.basicInfo ?? resource.basicInfo
  const overviewPath = `/resources/${resource.resourceId}`

  const handleSubmit = async (basicInfo: BasicInfo) => {
    const payload = toBasicInfoUpdatePayload(resource, basicInfo)

    if (resource.status === 'completed') {
      editBuffer.updateBasicInfo(resource, payload)
      toast.info('Basic Info changes kept locally', {
        description: 'Submit all changes from the resource overview to persist them.',
      })
      return
    }

    await updateMutation.mutateAsync({
      resourceId: String(resource.resourceId),
      basicInfo: payload,
    })
    toast.success('Basic Info saved')
  }

  return (
    <>
      <ResourcePageHeader
        resource={resource}
        title="Basic Info"
        subtitle={resource.name}
        backTo={overviewPath}
        backLabel="← Back to resource overview"
      />
      <FormCard>
        {resource.status === 'completed' ? <CompletedEditNotice /> : null}
        <BasicInfoForm
          defaultValues={values}
          isPending={updateMutation.isPending}
          error={updateMutation.error}
          submitLabel={
            resource.status === 'completed' ? 'Keep changes locally' : 'Save Basic Info'
          }
          onCancel={() => navigate(overviewPath)}
          onSubmit={handleSubmit}
          onSubmitSuccess={() => navigate(overviewPath)}
        />
      </FormCard>
    </>
  )
}
