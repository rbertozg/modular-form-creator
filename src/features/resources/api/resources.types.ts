export type ResourceStatus = 'draft' | 'completed'

export const PRIORITIES = ['low', 'medium', 'high'] as const
export const PROJECT_CATEGORIES = ['internal', 'external', 'vendor'] as const
export const TEAM_MEMBERS = [
  'FE devs',
  'BE devs',
  'Designer',
  'Data Eng',
  'Product Owner',
] as const

export type Priority = (typeof PRIORITIES)[number]
export type ProjectCategory = (typeof PROJECT_CATEGORIES)[number]
export type TeamMember = (typeof TEAM_MEMBERS)[number]

export interface BasicInfo {
  resourceName: string
  owner: string
  email: string
  description: string
  priority: Priority | ''
}

export interface ProjectDetails {
  projectName: string
  budget: string
  category: ProjectCategory | ''
  options: TeamMember[]
}

export interface Resource {
  _id: string
  resourceId: number
  name: string
  status: ResourceStatus
  basicInfo: BasicInfo
  projectDetails: ProjectDetails
  createdAt?: string
  updatedAt?: string
}

export interface ResourcePayload {
  name: string
  basicInfo: BasicInfo
  projectDetails: ProjectDetails
}

export interface ResourceListParams {
  page: number
  pageSize: number
  status?: ResourceStatus
  name?: string
  sortOrder: 'asc' | 'desc'
}

export interface ResourceListResponse {
  items: Resource[]
  pagination: {
    page: number
    pageSize: number
    totalItems: number
    totalPages: number
  }
}
