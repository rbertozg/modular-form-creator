import { createContext } from 'react'
import type { BasicInfo, ProjectDetails, Resource } from '../api/resources.types'
import type { EditBufferEntry } from './edit-buffer.reducer'

export interface BufferedResourceSummary {
  resourceId: string
  name: string
}

export interface EditBufferContextValue {
  dirtyResources: BufferedResourceSummary[]
  getEntry: (resourceId: string | number) => EditBufferEntry | undefined
  updateBasicInfo: (resource: Resource, basicInfo: BasicInfo) => void
  updateProjectDetails: (resource: Resource, projectDetails: ProjectDetails) => void
  clear: (resourceId: string | number) => void
}

export const EditBufferContext = createContext<EditBufferContextValue | null>(null)
