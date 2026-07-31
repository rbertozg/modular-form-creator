import { z } from 'zod'
import { PRIORITIES, PROJECT_CATEGORIES, TEAM_MEMBERS } from '../api/resources.types'

const namePattern = /^[A-Za-z0-9 -]+$/
const ownerPattern = /^[A-Za-z ]+$/
const integerPattern = /^\d+$/

export const resourceNameSchema = z
  .string()
  .trim()
  .min(1, 'Resource name is required.')
  .max(255, 'Resource name must be at most 255 characters.')
  .regex(namePattern, 'Use only letters, numbers, spaces, and hyphens.')

export const createResourceSchema = z.object({
  resourceName: resourceNameSchema,
})

export const basicInfoSchema = z.object({
  resourceName: resourceNameSchema,
  owner: z
    .string()
    .trim()
    .min(1, 'Owner is required.')
    .max(255, 'Owner must be at most 255 characters.')
    .regex(ownerPattern, 'Use only letters and spaces.'),
  email: z
    .string()
    .trim()
    .min(1, 'Email is required.')
    .email('Enter a valid email address.'),
  description: z
    .string()
    .trim()
    .min(1, 'Description is required.')
    .max(1000, 'Description must be at most 1000 characters.'),
  priority: z
    .union([z.enum(PRIORITIES), z.literal('')])
    .refine((value) => value !== '', 'Select a priority.'),
})

export const projectDetailsSchema = z.object({
  projectName: z
    .string()
    .trim()
    .min(1, 'Project name is required.')
    .max(255, 'Project name must be at most 255 characters.')
    .regex(namePattern, 'Use only letters, numbers, spaces, and hyphens.'),
  budget: z
    .string()
    .trim()
    .min(1, 'Budget is required.')
    .regex(integerPattern, 'Budget must contain only whole digits.'),
  category: z
    .union([z.enum(PROJECT_CATEGORIES), z.literal('')])
    .refine((value) => value !== '', 'Select a category.'),
  options: z.array(z.enum(TEAM_MEMBERS)).min(1, 'Select at least one team member.'),
})

export type BasicInfoFormInput = z.input<typeof basicInfoSchema>
export type BasicInfoFormValues = z.output<typeof basicInfoSchema>
export type CreateResourceFormValues = z.input<typeof createResourceSchema>
export type ProjectDetailsFormInput = z.input<typeof projectDetailsSchema>
export type ProjectDetailsFormValues = z.output<typeof projectDetailsSchema>
