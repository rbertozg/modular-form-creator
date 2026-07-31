import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { ThemeProvider } from 'styled-components'
import { describe, expect, it, vi } from 'vitest'
import { theme } from '../../design-system/theme/theme'
import { AlertMessage } from '../AlertMessage/AlertMessage'
import { ConfirmDialog } from '../ConfirmDialog/ConfirmDialog'
import { EmptyState, ErrorState, LoadingState } from '../PageState/PageState'

function renderWithTheme(node: ReactNode) {
  return render(<ThemeProvider theme={theme}>{node}</ThemeProvider>)
}

describe('feedback components', () => {
  it('uses appropriate live-region semantics for each alert tone', () => {
    const { rerender } = renderWithTheme(<AlertMessage tone="error">Failed</AlertMessage>)
    expect(screen.getByRole('alert')).toHaveAttribute('aria-live', 'assertive')

    rerender(
      <ThemeProvider theme={theme}>
        <AlertMessage tone="success">Saved</AlertMessage>
      </ThemeProvider>,
    )
    expect(screen.getByRole('status')).toHaveTextContent('Saved')

    rerender(
      <ThemeProvider theme={theme}>
        <AlertMessage>Information</AlertMessage>
      </ThemeProvider>,
    )
    expect(screen.getByRole('status')).toHaveTextContent('Information')
  })

  it('renders loading, empty, and retryable error states', async () => {
    const onRetry = vi.fn()
    const user = userEvent.setup()
    const { rerender } = renderWithTheme(<LoadingState label="Loading records" />)
    expect(screen.getByText('Loading records')).toBeInTheDocument()

    rerender(
      <ThemeProvider theme={theme}>
        <EmptyState title="Nothing here" description="Create an item." />
      </ThemeProvider>,
    )
    expect(screen.getByText('Create an item.')).toBeInTheDocument()

    rerender(
      <ThemeProvider theme={theme}>
        <ErrorState message="Network failed" onRetry={onRetry} />
      </ThemeProvider>,
    )
    await user.click(screen.getByRole('button', { name: 'Try again' }))
    expect(onRetry).toHaveBeenCalledOnce()

    rerender(
      <ThemeProvider theme={theme}>
        <ErrorState message="Permanent failure" />
      </ThemeProvider>,
    )
    expect(screen.queryByRole('button', { name: 'Try again' })).not.toBeInTheDocument()
  })

  it('prevents dismissing a pending confirmation', async () => {
    const onCancel = vi.fn()
    const onConfirm = vi.fn()
    const user = userEvent.setup()

    renderWithTheme(
      <ConfirmDialog
        isOpen
        title="Save?"
        message="Confirm the operation."
        confirmLabel="Save"
        isPending
        onCancel={onCancel}
        onConfirm={onConfirm}
      />,
    )

    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Working…' })).toBeDisabled()
    await user.keyboard('{Escape}')
    expect(onCancel).not.toHaveBeenCalled()
    expect(onConfirm).not.toHaveBeenCalled()
  })

  it('provides an accessible name, description, and initial focus', () => {
    renderWithTheme(
      <ConfirmDialog
        isOpen
        title="Delete resource?"
        message="This operation cannot be undone."
        confirmLabel="Delete"
        onCancel={vi.fn()}
        onConfirm={vi.fn()}
      />,
    )

    const dialog = screen.getByRole('dialog', {
      name: 'Delete resource?',
    })
    expect(dialog).toHaveAccessibleDescription('This operation cannot be undone.')
    expect(screen.getByRole('button', { name: 'Cancel' })).toHaveFocus()
  })
})
