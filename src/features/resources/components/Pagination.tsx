import styled from 'styled-components'
import { Button } from '../../../design-system'

interface PaginationProps {
  page: number
  totalPages: number
  onChange: (page: number) => void
}

const Wrapper = styled.nav`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.md};
`

const Label = styled.span`
  color: ${({ theme }) => theme.colors.inkMuted};
`

export function Pagination({ page, totalPages, onChange }: PaginationProps) {
  return (
    <Wrapper aria-label="Resources pagination">
      <Button
        type="button"
        size="small"
        variant="secondary"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
      >
        Previous
      </Button>
      <Label aria-live="polite">
        Page {page} of {totalPages}
      </Label>
      <Button
        type="button"
        size="small"
        variant="secondary"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
      >
        Next
      </Button>
    </Wrapper>
  )
}
