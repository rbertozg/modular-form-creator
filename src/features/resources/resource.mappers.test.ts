import { describe, expect, it } from 'vitest'
import { createCompleteResourceFixture } from '../../test/fixtures'
import {
  areResourcePayloadsEqual,
  doesCompletedResourceMatchPayload,
  toBasicInfoUpdatePayload,
  toCompletedResourceUpdatePayload,
  toResourcePayload,
} from './resource.mappers'

describe('resource mappers', () => {
  it('keeps the immutable resource name in a Basic Info update', () => {
    const resource = createCompleteResourceFixture()
    const values = {
      ...resource.basicInfo,
      resourceName: 'Manipulated name',
      owner: 'John Doe',
    }

    const payload = toBasicInfoUpdatePayload(resource, values)

    expect(payload).toEqual({
      ...values,
      resourceName: resource.name,
    })
    expect(payload).not.toBe(values)
    expect(values.resourceName).toBe('Manipulated name')
  })

  it('creates a safe buffer baseline without server-owned fields', () => {
    const resource = createCompleteResourceFixture()
    const payload = toResourcePayload(resource)

    expect(payload).toEqual({
      name: resource.name,
      basicInfo: resource.basicInfo,
      projectDetails: resource.projectDetails,
    })
    expect(payload).not.toHaveProperty('_id')
    expect(payload).not.toHaveProperty('resourceId')
    expect(payload).not.toHaveProperty('status')
    expect(payload).not.toHaveProperty('createdAt')
    expect(payload).not.toHaveProperty('updatedAt')
    expect(payload.basicInfo).not.toBe(resource.basicInfo)
    expect(payload.projectDetails).not.toBe(resource.projectDetails)
    expect(payload.projectDetails.options).not.toBe(resource.projectDetails.options)
  })

  it('merges buffered fields with the latest immutable resource name', () => {
    const latestResource = createCompleteResourceFixture({
      name: 'Authoritative name',
      basicInfo: {
        ...createCompleteResourceFixture().basicInfo,
        resourceName: 'Inconsistent server name',
      },
    })
    const bufferedPayload = {
      name: 'Manipulated top-level name',
      basicInfo: {
        ...latestResource.basicInfo,
        resourceName: 'Manipulated Basic Info name',
        owner: 'John Doe',
      },
      projectDetails: {
        ...latestResource.projectDetails,
        projectName: 'Buffered project',
        options: ['Designer' as const],
      },
    }

    const payload = toCompletedResourceUpdatePayload(latestResource, bufferedPayload)

    expect(payload).toEqual({
      name: latestResource.name,
      basicInfo: {
        ...bufferedPayload.basicInfo,
        resourceName: latestResource.name,
      },
      projectDetails: bufferedPayload.projectDetails,
    })
    expect(payload.basicInfo).not.toBe(bufferedPayload.basicInfo)
    expect(payload.projectDetails).not.toBe(bufferedPayload.projectDetails)
    expect(payload.projectDetails.options).not.toBe(
      bufferedPayload.projectDetails.options,
    )
    expect(bufferedPayload.name).toBe('Manipulated top-level name')
    expect(bufferedPayload.basicInfo.resourceName).toBe('Manipulated Basic Info name')
  })

  it('compares complete business payloads with team members as a set', () => {
    const resource = createCompleteResourceFixture()
    const payload = toResourcePayload(resource)

    expect(areResourcePayloadsEqual(payload, toResourcePayload(resource))).toBe(true)
    expect(
      areResourcePayloadsEqual(payload, {
        ...payload,
        projectDetails: {
          ...payload.projectDetails,
          options: [...payload.projectDetails.options].reverse(),
        },
      }),
    ).toBe(true)
    expect(
      areResourcePayloadsEqual(payload, {
        ...payload,
        projectDetails: {
          ...payload.projectDetails,
          options: ['Designer'],
        },
      }),
    ).toBe(false)
  })

  it('matches only a completed resource with the exact observed payload', () => {
    const resource = createCompleteResourceFixture()
    const payload = toResourcePayload(resource)

    expect(doesCompletedResourceMatchPayload(resource, payload)).toBe(true)
    expect(
      doesCompletedResourceMatchPayload({ ...resource, status: 'draft' }, payload),
    ).toBe(false)
    expect(
      doesCompletedResourceMatchPayload(
        {
          ...resource,
          basicInfo: {
            ...resource.basicInfo,
            resourceName: 'Inconsistent resource name',
          },
        },
        payload,
      ),
    ).toBe(false)
  })
})
