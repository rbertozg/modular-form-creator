import { useEffect, useState } from 'react'
import styled from 'styled-components'
import { Input, Select } from '../../../design-system'
import type { ResourceStatus } from '../api/resources.types'

interface ResourceFiltersProps {
  name: string
  status?: ResourceStatus
  sortOrder: 'asc' | 'desc'
  onNameChange: (value: string) => void
  onStatusChange: (value: string) => void
  onSortOrderChange: (value: string) => void
}

const Filters = styled.div`
  display: grid;
  grid-template-columns: minmax(220px, 1fr) repeat(2, minmax(150px, 220px));
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.lg};

  @media (max-width: 760px) {
    grid-template-columns: 1fr;
  }
`

function DebouncedSearchInput({
  initialValue,
  onSearch,
}: {
  initialValue: string
  onSearch: (value: string) => void
}) {
  const [value, setValue] = useState(initialValue)

  useEffect(() => {
    if (value === initialValue) {
      return
    }

    const timeout = window.setTimeout(() => onSearch(value), 300)
    return () => window.clearTimeout(timeout)
  }, [initialValue, onSearch, value])

  return (
    <Input
      label="Search"
      type="search"
      placeholder="Search by resource name"
      value={value}
      onChange={(event) => setValue(event.target.value)}
    />
  )
}

export function ResourceFilters({
  name,
  status,
  sortOrder,
  onNameChange,
  onStatusChange,
  onSortOrderChange,
}: ResourceFiltersProps) {
  return (
    <Filters aria-label="Resource filters">
      <DebouncedSearchInput key={name} initialValue={name} onSearch={onNameChange} />
      <Select
        label="Status"
        value={status ?? ''}
        options={[
          { value: '', label: 'All statuses' },
          { value: 'draft', label: 'Draft' },
          { value: 'completed', label: 'Completed' },
        ]}
        onChange={(event) => onStatusChange(event.target.value)}
      />
      <Select
        label="Sort"
        value={sortOrder}
        options={[
          { value: 'desc', label: 'Newest first' },
          { value: 'asc', label: 'Oldest first' },
        ]}
        onChange={(event) => onSortOrderChange(event.target.value)}
      />
    </Filters>
  )
}
