import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { ApiError, isPotentiallyCommittedMutationError } from '../../../api/api-error'
import { getResource } from '../api/resources.api'
import type { Resource, ResourceListResponse } from '../api/resources.types'
import { useEditBuffer } from '../edit-buffer/useEditBuffer'
import { resourceKeys, useCreateResource, useDeleteResource } from '../resource.queries'

interface ResourceListActionsOptions {
  itemCount: number
  page: number
  moveToPreviousPage: () => void
  refetchResources: () => Promise<{
    data?: ResourceListResponse
    isError: boolean
  }>
}

export function useResourceListActions({
  itemCount,
  page,
  moveToPreviousPage,
  refetchResources,
}: ResourceListActionsOptions) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const editBuffer = useEditBuffer()
  const createMutation = useCreateResource()
  const deleteMutation = useDeleteResource()
  const [isCreateOpen, setCreateOpen] = useState(false)
  const [resourceToDelete, setResourceToDelete] = useState<Resource | null>(null)
  const [isReconcilingDelete, setReconcilingDelete] = useState(false)
  const [reconciliationMessage, setReconciliationMessage] = useState('')

  const openCreate = () => {
    setReconciliationMessage('')
    setCreateOpen(true)
  }

  const closeCreate = () => {
    if (createMutation.isPending) {
      return
    }

    createMutation.reset()
    setCreateOpen(false)
  }

  const create = (resourceName: string) => {
    createMutation.mutate(resourceName, {
      onSuccess: (resource) => {
        setCreateOpen(false)
        toast.success('Resource created')
        navigate(`/resources/${resource.resourceId}`)
      },
    })
  }

  const requestDelete = (resource: Resource) => {
    deleteMutation.reset()
    setReconcilingDelete(false)
    setReconciliationMessage('')
    setResourceToDelete(resource)
  }

  const cancelDelete = () => {
    if (deleteMutation.isPending || isReconcilingDelete) {
      return
    }

    deleteMutation.reset()
    setResourceToDelete(null)
  }

  const confirmDelete = () => {
    if (!resourceToDelete || isReconcilingDelete) {
      return
    }

    const resource = resourceToDelete
    const shouldMoveToPreviousPage = page > 1 && itemCount === 1

    deleteMutation.mutate(resource.resourceId, {
      onSuccess: (deletedResource) => {
        editBuffer.clear(deletedResource.resourceId)
        setResourceToDelete(null)
        toast.success('Resource deleted')

        if (shouldMoveToPreviousPage) {
          moveToPreviousPage()
        }
      },
      onError: async (error) => {
        if (!isPotentiallyCommittedMutationError(error)) {
          return
        }

        setReconcilingDelete(true)
        let deletionConfirmed = false

        try {
          await getResource(resource.resourceId)
        } catch (verificationError) {
          deletionConfirmed =
            verificationError instanceof ApiError && verificationError.status === 404
        }

        if (!deletionConfirmed) {
          setReconcilingDelete(false)
          return
        }

        const listResult = await refetchResources().catch(() => ({
          data: undefined,
          isError: true,
        }))
        const isListSynchronized =
          !listResult.isError &&
          Boolean(
            listResult.data &&
            !listResult.data.items.some(
              (item) => item.resourceId === resource.resourceId,
            ),
          )
        queryClient.removeQueries({
          queryKey: resourceKeys.detail(resource.resourceId),
        })
        editBuffer.clear(resource.resourceId)
        deleteMutation.reset()
        setResourceToDelete(null)
        setReconciliationMessage(
          !isListSynchronized
            ? 'Deletion was confirmed, but the resource list could not be synchronized. Retry loading the list.'
            : 'The resource is no longer present on the server. The list has been synchronized.',
        )

        if (shouldMoveToPreviousPage) {
          moveToPreviousPage()
        }

        setReconcilingDelete(false)
      },
    })
  }

  return {
    cancelDelete,
    closeCreate,
    confirmDelete,
    create,
    createMutation,
    deleteMutation,
    isDeletePending: deleteMutation.isPending || isReconcilingDelete,
    isCreateOpen,
    openCreate,
    requestDelete,
    reconciliationMessage,
    resourceToDelete,
  }
}
