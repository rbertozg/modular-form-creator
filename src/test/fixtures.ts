import type { Resource } from '../features/resources/api/resources.types'

export function createResourceFixture(overrides: Partial<Resource> = {}): Resource {
  return {
    _id: '507f1f77bcf86cd799439011',
    resourceId: 1,
    name: 'Customer onboarding',
    status: 'draft',
    basicInfo: {
      resourceName: 'Customer onboarding',
      owner: '',
      email: '',
      description: '',
      priority: '',
    },
    projectDetails: {
      projectName: '',
      budget: '',
      category: '',
      options: [],
    },
    createdAt: '2026-07-29T12:00:00.000Z',
    updatedAt: '2026-07-29T12:00:00.000Z',
    ...overrides,
  }
}

export function createCompleteResourceFixture(
  overrides: Partial<Resource> = {},
): Resource {
  return createResourceFixture({
    status: 'completed',
    basicInfo: {
      resourceName: 'Customer onboarding',
      owner: 'Jane Doe',
      email: 'jane@example.com',
      description: 'Customer onboarding workflow',
      priority: 'high',
    },
    projectDetails: {
      projectName: 'Onboarding project',
      budget: '10000',
      category: 'internal',
      options: ['FE devs', 'BE devs'],
    },
    ...overrides,
  })
}
