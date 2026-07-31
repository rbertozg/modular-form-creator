import type {
  BasicInfo,
  ProjectDetails,
  Resource,
  ResourcePayload,
} from '../api/resources.types'
import {
  areResourcePayloadsEqual,
  toBasicInfoUpdatePayload,
  toResourcePayload,
} from '../domain/resource.mappers'

export interface EditBufferEntry {
  basePayload: ResourcePayload
  payload: ResourcePayload
  baseUpdatedAt?: string
  isDirty: boolean
}

export type EditBufferState = Record<string, EditBufferEntry>

export type EditBufferAction =
  | {
      type: 'updateBasicInfo'
      resource: Resource
      basicInfo: BasicInfo
    }
  | {
      type: 'updateProjectDetails'
      resource: Resource
      projectDetails: ProjectDetails
    }
  | { type: 'clear'; resourceId: string | number }

function getEntry(state: EditBufferState, resource: Resource): EditBufferEntry {
  const basePayload = toResourcePayload(resource)

  return (
    state[String(resource.resourceId)] ?? {
      basePayload,
      payload: toResourcePayload(resource),
      baseUpdatedAt: resource.updatedAt,
      isDirty: false,
    }
  )
}

function updateEntry(
  state: EditBufferState,
  resourceId: string,
  entry: EditBufferEntry,
): EditBufferState {
  if (areResourcePayloadsEqual(entry.basePayload, entry.payload)) {
    const remaining = { ...state }
    delete remaining[resourceId]
    return remaining
  }

  return {
    ...state,
    [resourceId]: {
      ...entry,
      isDirty: true,
    },
  }
}

export function editBufferReducer(
  state: EditBufferState,
  action: EditBufferAction,
): EditBufferState {
  if (action.type === 'clear') {
    const resourceId = String(action.resourceId)
    const remaining = { ...state }
    delete remaining[resourceId]
    return remaining
  }

  const resourceId = String(action.resource.resourceId)
  const entry = getEntry(state, action.resource)

  if (action.type === 'updateBasicInfo') {
    return updateEntry(state, resourceId, {
      ...entry,
      payload: {
        ...entry.payload,
        basicInfo: toBasicInfoUpdatePayload(action.resource, action.basicInfo),
      },
    })
  }

  return updateEntry(state, resourceId, {
    ...entry,
    payload: {
      ...entry.payload,
      projectDetails: {
        ...action.projectDetails,
        options: [...action.projectDetails.options],
      },
    },
  })
}
