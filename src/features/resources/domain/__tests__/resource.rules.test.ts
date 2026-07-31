import { describe, expect, it } from 'vitest'
import {
  createCompleteResourceFixture,
  createResourceFixture,
} from '../../../../test/fixtures'
import {
  canAccessProjectDetails,
  canProvision,
  isBasicInfoComplete,
  isProjectDetailsComplete,
} from '../resource.rules'

describe('resource rules', () => {
  it('recognizes complete module values', () => {
    const resource = createCompleteResourceFixture({ status: 'draft' })

    expect(isBasicInfoComplete(resource.basicInfo)).toBe(true)
    expect(isProjectDetailsComplete(resource.projectDetails)).toBe(true)
    expect(canProvision(resource)).toBe(true)
  })

  it('does not allow incomplete drafts to be provisioned', () => {
    const resource = createResourceFixture()

    expect(isBasicInfoComplete(resource.basicInfo)).toBe(false)
    expect(isProjectDetailsComplete(resource.projectDetails)).toBe(false)
    expect(canProvision(resource)).toBe(false)
  })

  it('does not allow completed resources to be provisioned again', () => {
    expect(canProvision(createCompleteResourceFixture())).toBe(false)
  })

  it.each([
    {
      description: 'an incomplete draft',
      resource: createResourceFixture(),
      expected: false,
    },
    {
      description: 'a draft with completed Basic Info',
      resource: createResourceFixture({
        basicInfo: createCompleteResourceFixture().basicInfo,
      }),
      expected: true,
    },
    {
      description: 'an incomplete completed resource',
      resource: createResourceFixture({ status: 'completed' }),
      expected: true,
    },
  ])(
    'returns $expected when Project Details is requested for $description',
    ({ resource, expected }) => {
      expect(canAccessProjectDetails(resource)).toBe(expected)
    },
  )
})
