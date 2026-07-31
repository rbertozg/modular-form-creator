import { useEffect, useId, useRef } from 'react'
import { Button } from '../../design-system'
import { AlertMessage } from '../AlertMessage/AlertMessage'
import { Actions, Content, Dialog, Message, Title } from './ConfirmDialog.styles'

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
