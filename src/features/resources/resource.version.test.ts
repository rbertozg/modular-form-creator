import { describe, expect, it } from 'vitest'
import { hasResourceVersionChanged } from './resource.version'

describe('hasResourceVersionChanged', () => {
  it('detects a changed server timestamp', () => {
    expect(
      hasResourceVersionChanged('2026-07-29T12:00:00.000Z', '2026-07-30T12:00:00.000Z'),
    ).toBe(true)
  })

  it('accepts the same timestamp', () => {
    expect(
      hasResourceVersionChanged('2026-07-29T12:00:00.000Z', '2026-07-29T12:00:00.000Z'),
    ).toBe(false)
  })

  it('does not claim a conflict when either timestamp is unavailable', () => {
    expect(hasResourceVersionChanged(undefined, '2026-07-30T12:00:00.000Z')).toBe(false)
    expect(hasResourceVersionChanged('2026-07-29T12:00:00.000Z', undefined)).toBe(false)
  })
})
