import { useEditBuffer, applyEditBuffer } from '../edit-buffer/useEditBuffer'
import { useResource } from '../resource.queries'

export function useResourceWithBuffer(resourceId: string | undefined) {
  const resourceQuery = useResource(resourceId)
  const editBuffer = useEditBuffer()
  const resource = resourceQuery.data
  const bufferEntry =
    resource?.status === 'completed'
      ? editBuffer.getEntry(resource.resourceId)
      : undefined

  return {
    bufferEntry,
    editBuffer,
    resourceQuery,
    workingResource: resource
      ? applyEditBuffer(resource, bufferEntry?.payload)
      : undefined,
  }
}
