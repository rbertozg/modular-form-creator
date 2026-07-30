import { apiRequest } from '../../../api/http-client'
import {
  parseResourceListResponse,
  parseResourceResponse,
} from './resource-response.schemas'
import type {
  BasicInfo,
  ProjectDetails,
  Resource,
  ResourceListParams,
  ResourceListResponse,
  ResourcePayload,
} from './resources.types'

function resourcePath(resourceId: string | number): string {
  return `/resources/${encodeURIComponent(String(resourceId))}`
}

async function requestResource(path: string, init: RequestInit = {}): Promise<Resource> {
  const response = await apiRequest<unknown>(path, init)
  return parseResourceResponse(response)
}

export async function listResources(
  params: ResourceListParams,
  signal?: AbortSignal,
): Promise<ResourceListResponse> {
  const searchParams = new URLSearchParams({
    page: String(params.page),
    pageSize: String(params.pageSize),
    sortOrder: params.sortOrder,
  })

  if (params.status) {
    searchParams.set('status', params.status)
  }
  if (params.name?.trim()) {
    searchParams.set('name', params.name.trim())
  }

  const response = await apiRequest<unknown>(`/resources?${searchParams.toString()}`, {
    signal,
  })

  return parseResourceListResponse(response)
}

export function getResource(
  resourceId: string | number,
  signal?: AbortSignal,
): Promise<Resource> {
  return requestResource(resourcePath(resourceId), { signal })
}

export function createResource(resourceName: string): Promise<Resource> {
  return requestResource('/resources', {
    method: 'POST',
    body: JSON.stringify({ resourceName }),
  })
}

export function updateBasicInfo(
  resourceId: string | number,
  basicInfo: BasicInfo,
): Promise<Resource> {
  return requestResource(`${resourcePath(resourceId)}/basic-info`, {
    method: 'PATCH',
    body: JSON.stringify(basicInfo),
  })
}

export function updateProjectDetails(
  resourceId: string | number,
  projectDetails: ProjectDetails,
): Promise<Resource> {
  return requestResource(`${resourcePath(resourceId)}/project-details`, {
    method: 'PATCH',
    body: JSON.stringify(projectDetails),
  })
}

export function provisionResource(resourceId: string | number): Promise<Resource> {
  return requestResource(`${resourcePath(resourceId)}/provisioning`, {
    method: 'PATCH',
  })
}

export function replaceResource(
  resourceId: string | number,
  payload: ResourcePayload,
): Promise<Resource> {
  return requestResource(resourcePath(resourceId), {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export function deleteResource(resourceId: string | number): Promise<Resource> {
  return requestResource(resourcePath(resourceId), {
    method: 'DELETE',
  })
}
