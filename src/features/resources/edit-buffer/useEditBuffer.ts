import { useContext } from 'react'
import type { Resource, ResourcePayload } from '../api/resources.types'
import { EditBufferContext } from './edit-buffer.context'

export function useEditBuffer() {
  const context = useContext(EditBufferContext)

  if (!context) {
    throw new Error('useEditBuffer must be used within EditBufferProvider.')
  }

  return context
}

export function applyEditBuffer(resource: Resource, payload?: ResourcePayload): Resource {
  if (!payload) {
    return resource
  }

  return {
    ...resource,
    name: payload.name,
    basicInfo: payload.basicInfo,
    projectDetails: payload.projectDetails,
  }
}
