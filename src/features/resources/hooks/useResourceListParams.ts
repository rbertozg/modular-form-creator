import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { ResourceListParams, ResourceStatus } from '../api/resources.types'

const PAGE_SIZE = 10

function parsePage(value: string | null): number {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1
}

function parseStatus(value: string | null): ResourceStatus | undefined {
  return value === 'draft' || value === 'completed' ? value : undefined
}

export function useResourceListParams() {
  const [searchParams, setSearchParams] = useSearchParams()
  const page = parsePage(searchParams.get('page'))
  const status = parseStatus(searchParams.get('status'))
  const sortOrder: ResourceListParams['sortOrder'] =
    searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc'
  const name = searchParams.get('name') ?? ''

  const updateFilter = useCallback(
    (key: string, value: string) => {
      setSearchParams((current) => {
        const next = new URLSearchParams(current)

        if (value) {
          next.set(key, value)
        } else {
          next.delete(key)
        }

        next.set('page', '1')
        return next
      })
    },
    [setSearchParams],
  )

  const setName = useCallback(
    (value: string) => updateFilter('name', value.trim()),
    [updateFilter],
  )
  const setStatus = useCallback(
    (value: string) => updateFilter('status', value),
    [updateFilter],
  )
  const setSortOrder = useCallback(
    (value: string) => updateFilter('sortOrder', value === 'asc' ? 'asc' : 'desc'),
    [updateFilter],
  )
  const setPage = useCallback(
    (nextPage: number) => {
      setSearchParams((current) => {
        const next = new URLSearchParams(current)
        next.set('page', String(Math.max(1, nextPage)))
        return next
      })
    },
    [setSearchParams],
  )
  const moveToPreviousPage = useCallback(() => setPage(page - 1), [page, setPage])

  const queryParams = useMemo<ResourceListParams>(
    () => ({
      page,
      pageSize: PAGE_SIZE,
      status,
      name,
      sortOrder,
    }),
    [name, page, sortOrder, status],
  )

  return {
    name,
    page,
    queryParams,
    setName,
    setPage,
    setSortOrder,
    setStatus,
    sortOrder,
    status,
    moveToPreviousPage,
  }
}
