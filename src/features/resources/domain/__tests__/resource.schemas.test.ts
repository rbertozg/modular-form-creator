import { describe, expect, it } from 'vitest'
import {
  basicInfoSchema,
  createResourceSchema,
  projectDetailsSchema,
} from '../resource.schemas'
import { createCompleteResourceFixture } from '../../../../test/fixtures'

describe('resource schemas', () => {
  const completeResource = createCompleteResourceFixture()

  it('accepts payloads supported by the backend', () => {
    expect(basicInfoSchema.safeParse(completeResource.basicInfo).success).toBe(true)
    expect(projectDetailsSchema.safeParse(completeResource.projectDetails).success).toBe(
      true,
    )
  })

  it.each([
    ['', 'required'],
    ['Zażółć', 'letters, numbers, spaces, and hyphens'],
    ['name_with_underscore', 'letters, numbers, spaces, and hyphens'],
  ])('rejects invalid resource name %j', (resourceName, message) => {
    const result = createResourceSchema.safeParse({ resourceName })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message.toLowerCase()).toContain(message)
    }
  })

  it('rejects invalid Basic Info fields', () => {
    const result = basicInfoSchema.safeParse({
      ...completeResource.basicInfo,
      owner: 'Jane 123',
      email: 'not-an-email',
      priority: '',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.flatten().fieldErrors).toMatchObject({
        owner: expect.any(Array),
        email: expect.any(Array),
        priority: expect.any(Array),
      })
    }
  })

  it('rejects decimals, missing category, and an empty team', () => {
    const result = projectDetailsSchema.safeParse({
      ...completeResource.projectDetails,
      budget: '10.50',
      category: '',
      options: [],
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.flatten().fieldErrors).toMatchObject({
        budget: expect.any(Array),
        category: expect.any(Array),
        options: expect.any(Array),
      })
    }
  })
})
