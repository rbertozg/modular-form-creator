import { describe, expect, it } from 'vitest'
import { createCompleteResourceFixture } from '../../../test/fixtures'
import { editBufferReducer } from './edit-buffer.reducer'

describe('editBufferReducer', () => {
  it('buffers Basic Info without modifying the source resource', () => {
    const resource = createCompleteResourceFixture()
    const nextBasicInfo = {
      ...resource.basicInfo,
      owner: 'John Doe',
    }

    const state = editBufferReducer(
      {},
      { type: 'updateBasicInfo', resource, basicInfo: nextBasicInfo },
    )

    expect(state['1'].payload.basicInfo.owner).toBe('John Doe')
    expect(state['1'].payload.projectDetails).toEqual(resource.projectDetails)
    expect(state['1'].baseUpdatedAt).toBe(resource.updatedAt)
    expect(state['1'].isDirty).toBe(true)
    expect(resource.basicInfo.owner).toBe('Jane Doe')
  })

  it('does not buffer a manipulated immutable resource name', () => {
    const resource = createCompleteResourceFixture()

    const state = editBufferReducer(
      {},
      {
        type: 'updateBasicInfo',
        resource,
        basicInfo: {
          ...resource.basicInfo,
          resourceName: 'Manipulated name',
          owner: 'John Doe',
        },
      },
    )

    expect(state['1'].payload.name).toBe(resource.name)
    expect(state['1'].payload.basicInfo.resourceName).toBe(resource.name)
  })

  it('combines independently buffered module changes', () => {
    const resource = createCompleteResourceFixture()
    const basicState = editBufferReducer(
      {},
      {
        type: 'updateBasicInfo',
        resource,
        basicInfo: { ...resource.basicInfo, owner: 'John Doe' },
      },
    )
    const state = editBufferReducer(basicState, {
      type: 'updateProjectDetails',
      resource,
      projectDetails: {
        ...resource.projectDetails,
        budget: '25000',
      },
    })

    expect(state['1'].payload.basicInfo.owner).toBe('John Doe')
    expect(state['1'].payload.projectDetails.budget).toBe('25000')
  })

  it('removes the buffer after all values return to the server baseline', () => {
    const resource = createCompleteResourceFixture()
    const dirtyState = editBufferReducer(
      {},
      {
        type: 'updateBasicInfo',
        resource,
        basicInfo: { ...resource.basicInfo, owner: 'John Doe' },
      },
    )

    const state = editBufferReducer(dirtyState, {
      type: 'updateBasicInfo',
      resource,
      basicInfo: resource.basicInfo,
    })

    expect(state).toEqual({})
  })

  it('clears all temporary data for one resource', () => {
    const resource = createCompleteResourceFixture()
    const dirtyState = editBufferReducer(
      {},
      {
        type: 'updateBasicInfo',
        resource,
        basicInfo: { ...resource.basicInfo, owner: 'John Doe' },
      },
    )

    expect(
      editBufferReducer(dirtyState, {
        type: 'clear',
        resourceId: resource.resourceId,
      }),
    ).toEqual({})
  })
})
