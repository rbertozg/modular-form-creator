import { z } from 'zod'
import { ApiError } from '../../../api/api-error'
import {
  PRIORITIES,
  PROJECT_CATEGORIES,
  TEAM_MEMBERS,
  type Resource,
  type ResourceListResponse,
} from './resources.types'

const CONTRACT_ERROR_STATUS = 502

export const RESOURCE_CONTRACT_ERROR_MESSAGE =
  'The API returned an invalid resource response.'
export const RESOURCE_LIST_CONTRACT_ERROR_MESSAGE =
  'The API returned an invalid resource list response.'

const basicInfoResponseSchema = z.object({
  resourceName: z.string(),
  owner: z.string(),
  email: z.string(),
  description: z.string(),
  priority: z.union([z.enum(PRIORITIES), z.literal('')]),
})

const projectDetailsResponseSchema = z.object({
  projectName: z.string(),
  budget: z.string(),
  category: z.union([z.enum(PROJECT_CATEGORIES), z.literal('')]),
  options: z.array(z.enum(TEAM_MEMBERS)),
})

export const resourceResponseSchema = z.object({
  _id: z.string(),
  resourceId: z.number().int().positive(),
  name: z.string(),
  status: z.enum(['draft', 'completed']),
  basicInfo: basicInfoResponseSchema,
  projectDetails: projectDetailsResponseSchema,
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
})

export const resourceListResponseSchema = z.object({
  items: z.array(resourceResponseSchema),
  pagination: z.object({
    page: z.number().int().positive(),
    pageSize: z.number().int().positive(),
    totalItems: z.number().int().nonnegative(),
    totalPages: z.number().int().positive(),
  }),
})

function toContractError(message: string, error: z.ZodError): ApiError {
  return new ApiError(message, CONTRACT_ERROR_STATUS, {
    issues: error.issues.map((issue) => ({
      path: issue.path.map(String).join('.'),
      message: issue.message,
    })),
  })
}

export function parseResourceResponse(value: unknown): Resource {
  const result = resourceResponseSchema.safeParse(value)

  if (!result.success) {
    throw toContractError(RESOURCE_CONTRACT_ERROR_MESSAGE, result.error)
  }

  return result.data
}

export function parseResourceListResponse(value: unknown): ResourceListResponse {
  const result = resourceListResponseSchema.safeParse(value)

  if (!result.success) {
    throw toContractError(RESOURCE_LIST_CONTRACT_ERROR_MESSAGE, result.error)
  }

  return result.data
}
