import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { isPotentiallyCommittedMutationError } from '../../../api/api-error'
import { getResource } from '../api/resources.api'
import type { Resource } from '../api/resources.types'
import type { EditBufferEntry } from '../edit-buffer/edit-buffer.reducer'
import { useEditBuffer } from '../edit-buffer/useEditBuffer'
import {
  resourceKeys,
  useProvisionResource,
  useReplaceResource,
} from '../resource.queries'
import {
  doesCompletedResourceMatchPayload,
  toCompletedResourceUpdatePayload,
} from '../domain/resource.mappers'
import { hasResourceVersionChanged } from '../domain/resource.version'

export type ResourceDialogAction = 'provision' | 'save' | 'discard' | null

interface ResourceOverviewActionsOptions {
  resource?: Resource
  bufferEntry?: EditBufferEntry
}

function getDialogCopy(action: ResourceDialogAction) {
  switch (action) {
    case 'provision':
      return {
        title: 'Complete this resource?',
        message: 'Provisioning permanently moves the resource from draft to completed.',
        confirmLabel: 'Complete resource',
      }
    case 'save':
      return {
        title: 'Submit all buffered changes?',
        message:
          'Basic Info and Project Details will be persisted together in one full update.',
        confirmLabel: 'Submit changes',
      }
    case 'discard':
      return {
        title: 'Discard buffered changes?',
        message: 'All temporary edits for this resource will be lost immediately.',
        confirmLabel: 'Discard changes',
      }
    default:
      return { title: '', message: '', confirmLabel: '' }
  }
}

export function useResourceOverviewActions({
  resource,
  bufferEntry,
}: ResourceOverviewActionsOptions) {
  const queryClient = useQueryClient()
  const editBuffer = useEditBuffer()
  const provisionMutation = useProvisionResource()
  const replaceMutation = useReplaceResource()
  const [dialogAction, setDialogAction] = useState<ResourceDialogAction>(null)
  const [isCheckingVersion, setCheckingVersion] = useState(false)
  const [conflictMessage, setConflictMessage] = useState('')
  const [reconciliationMessage, setReconciliationMessage] = useState('')

  const isPending =
    isCheckingVersion || provisionMutation.isPending || replaceMutation.isPending

  const openDialog = (action: Exclude<ResourceDialogAction, null>) => {
    provisionMutation.reset()
    replaceMutation.reset()
    setConflictMessage('')
    setReconciliationMessage('')
    setDialogAction(action)
  }

  const closeDialog = () => {
    if (!isPending) {
      setDialogAction(null)
    }
  }

  const readLatestResource = async (): Promise<Resource | undefined> => {
    if (!resource) {
      return undefined
    }

    try {
      const latest = await getResource(resource.resourceId)
      return latest.resourceId === resource.resourceId ? latest : undefined
    } catch {
      return undefined
    }
  }

  const synchronizeResource = (latest: Resource) => {
    queryClient.setQueryData(resourceKeys.detail(latest.resourceId), latest)
  }

  const confirmDialog = async () => {
    if (!resource) {
      return
    }

    if (dialogAction === 'discard') {
      editBuffer.clear(resource.resourceId)
      setDialogAction(null)
      setConflictMessage('')
      toast.info('Local changes discarded')
      return
    }

    if (dialogAction === 'provision') {
      try {
        await provisionMutation.mutateAsync({
          resourceId: String(resource.resourceId),
        })
        setDialogAction(null)
        toast.success('Resource completed')
      } catch (error) {
        if (!isPotentiallyCommittedMutationError(error)) {
          return
        }

        setCheckingVersion(true)
        const latest = await readLatestResource()
        setCheckingVersion(false)

        if (latest?.status === 'completed') {
          synchronizeResource(latest)
          provisionMutation.reset()
          setDialogAction(null)
          setReconciliationMessage(
            'The resource was completed on the server. Its current status has been synchronized.',
          )
        }
      }
      return
    }

    if (dialogAction !== 'save' || !bufferEntry) {
      return
    }

    setCheckingVersion(true)
    setConflictMessage('')
    const latest = await readLatestResource()
    setCheckingVersion(false)

    if (!latest || latest.status !== 'completed') {
      setDialogAction(null)
      setConflictMessage(
        'The latest server version could not be verified. No changes were submitted.',
      )
      return
    }

    synchronizeResource(latest)

    if (hasResourceVersionChanged(bufferEntry.baseUpdatedAt, latest.updatedAt)) {
      setDialogAction(null)
      setConflictMessage(
        'This resource changed on the server after editing began. Discard the local buffer and review the latest data before trying again.',
      )
      return
    }

    const payload = toCompletedResourceUpdatePayload(latest, bufferEntry.payload)

    try {
      await replaceMutation.mutateAsync({
        resourceId: String(resource.resourceId),
        payload,
      })
      editBuffer.clear(resource.resourceId)
      setDialogAction(null)
      toast.success('All changes submitted')
    } catch (error) {
      if (!isPotentiallyCommittedMutationError(error)) {
        return
      }

      setCheckingVersion(true)
      const reconciledResource = await readLatestResource()
      setCheckingVersion(false)

      if (reconciledResource?.status === 'completed') {
        synchronizeResource(reconciledResource)
      }

      if (
        reconciledResource &&
        doesCompletedResourceMatchPayload(reconciledResource, payload)
      ) {
        editBuffer.clear(resource.resourceId)
        replaceMutation.reset()
        setDialogAction(null)
        setReconciliationMessage(
          'The buffered changes were saved on the server. The current data has been synchronized.',
        )
      }
    }
  }

  return {
    closeDialog,
    confirmDialog,
    conflictMessage,
    dialogAction,
    dialogCopy: getDialogCopy(dialogAction),
    dialogError:
      dialogAction === 'provision'
        ? provisionMutation.error
        : dialogAction === 'save'
          ? replaceMutation.error
          : null,
    isPending,
    mutationError: provisionMutation.error ?? replaceMutation.error,
    openDialog,
    reconciliationMessage,
  }
}
