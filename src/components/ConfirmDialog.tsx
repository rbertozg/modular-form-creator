import { useEffect, useId, useRef } from 'react'
import styled from 'styled-components'
import { Button } from '../design-system'
import { AlertMessage } from './AlertMessage'

interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  message: string
  confirmLabel: string
  cancelLabel?: string
  isPending?: boolean
  isConfirmDisabled?: boolean
  error?: string
  onCancel: () => void
  onConfirm: () => void
}

const Dialog = styled.dialog`
  width: min(440px, calc(100vw - 32px));
  padding: 0;
  border: 0;
  border-radius: ${({ theme }) => theme.radii.md};
  color: ${({ theme }) => theme.colors.inkStrong};
  box-shadow: ${({ theme }) => theme.shadows.raised};

  &::backdrop {
    background: rgba(18, 33, 43, 0.56);
  }
`

const Content = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.lg};
`

const Title = styled.h2`
  margin: 0;
`

const Message = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.inkMuted};
`

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing.sm};
`

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel,
  cancelLabel = 'Cancel',
  isPending = false,
  isConfirmDisabled = false,
  error,
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const descriptionId = useId()

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) {
      return
    }

    if (isOpen && !dialog.open) {
      dialog.showModal()
    } else if (!isOpen && dialog.open) {
      dialog.close()
    }
  }, [isOpen])

  return (
    <Dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      onCancel={(event) => {
        event.preventDefault()
        if (!isPending) {
          onCancel()
        }
      }}
      onClose={() => {
        if (!isPending && isOpen) {
          onCancel()
        }
      }}
    >
      <Content>
        <Title id={titleId}>{title}</Title>
        <Message id={descriptionId}>{message}</Message>
        {error ? <AlertMessage tone="error">{error}</AlertMessage> : null}
        <Actions>
          <Button
            type="button"
            variant="secondary"
            disabled={isPending}
            autoFocus
            onClick={onCancel}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            disabled={isPending || isConfirmDisabled}
            onClick={onConfirm}
          >
            {isPending ? 'Working…' : confirmLabel}
          </Button>
        </Actions>
      </Content>
    </Dialog>
  )
}
