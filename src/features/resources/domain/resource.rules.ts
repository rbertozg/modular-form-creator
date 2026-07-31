import type { BasicInfo, ProjectDetails, Resource } from '../api/resources.types'
import { basicInfoSchema, projectDetailsSchema } from './resource.schemas'

export function isBasicInfoComplete(basicInfo: BasicInfo): boolean {
  return basicInfoSchema.safeParse(basicInfo).success
}

export function isProjectDetailsComplete(projectDetails: ProjectDetails): boolean {
  return projectDetailsSchema.safeParse(projectDetails).success
}

export function canProvision(resource: Resource): boolean {
  return (
    resource.status === 'draft' &&
    isBasicInfoComplete(resource.basicInfo) &&
    isProjectDetailsComplete(resource.projectDetails)
  )
}

export function canAccessProjectDetails(resource: Resource): boolean {
  return resource.status === 'completed' || isBasicInfoComplete(resource.basicInfo)
}
