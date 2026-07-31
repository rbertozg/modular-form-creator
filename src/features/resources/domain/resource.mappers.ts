import type { BasicInfo, Resource, ResourcePayload } from '../api/resources.types'

export function toBasicInfoUpdatePayload(
  resource: Resource,
  basicInfo: BasicInfo,
): BasicInfo {
  return {
    ...basicInfo,
    resourceName: resource.name,
  }
}

export function toResourcePayload(resource: Resource): ResourcePayload {
  return {
    name: resource.name,
    basicInfo: toBasicInfoUpdatePayload(resource, resource.basicInfo),
    projectDetails: {
      ...resource.projectDetails,
      options: [...resource.projectDetails.options],
    },
  }
}

export function toCompletedResourceUpdatePayload(
  latestResource: Resource,
  bufferedPayload: ResourcePayload,
): ResourcePayload {
  return {
    name: latestResource.name,
    basicInfo: toBasicInfoUpdatePayload(latestResource, bufferedPayload.basicInfo),
    projectDetails: {
      ...bufferedPayload.projectDetails,
      options: [...bufferedPayload.projectDetails.options],
    },
  }
}

export function areResourcePayloadsEqual(
  left: ResourcePayload,
  right: ResourcePayload,
): boolean {
  const leftOptions = [...left.projectDetails.options].sort()
  const rightOptions = [...right.projectDetails.options].sort()

  return (
    left.name === right.name &&
    left.basicInfo.resourceName === right.basicInfo.resourceName &&
    left.basicInfo.owner === right.basicInfo.owner &&
    left.basicInfo.email === right.basicInfo.email &&
    left.basicInfo.description === right.basicInfo.description &&
    left.basicInfo.priority === right.basicInfo.priority &&
    left.projectDetails.projectName === right.projectDetails.projectName &&
    left.projectDetails.budget === right.projectDetails.budget &&
    left.projectDetails.category === right.projectDetails.category &&
    leftOptions.length === rightOptions.length &&
    leftOptions.every((option, index) => option === rightOptions[index])
  )
}

export function doesCompletedResourceMatchPayload(
  resource: Resource,
  payload: ResourcePayload,
): boolean {
  return (
    resource.status === 'completed' &&
    areResourcePayloadsEqual(
      {
        name: resource.name,
        basicInfo: {
          ...resource.basicInfo,
        },
        projectDetails: {
          ...resource.projectDetails,
          options: [...resource.projectDetails.options],
        },
      },
      payload,
    )
  )
}
