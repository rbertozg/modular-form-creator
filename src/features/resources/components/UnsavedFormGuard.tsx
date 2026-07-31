import { useCallback } from 'react'
import { useBeforeUnload } from 'react-router-dom'
import { ConfirmDialog } from '../../../components/ConfirmDialog/ConfirmDialog'

function BeforeUnloadWarning() {
  useBeforeUnload(
    useCallback((event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = true
    }, []),
  )

  return null
}

interface UnsavedFormGuardProps {
  isDirty: boolean
  isNavigationBlocked: boolean
  isSubmissionPending: boolean
  onCancelNavigation: () => void
  onConfirmNavigation: () => void
}

export function UnsavedFormGuard({
  isDirty,
  isNavigationBlocked,
  isSubmissionPending,
  onCancelNavigation,
  onConfirmNavigation,
}: UnsavedFormGuardProps) {
  return (
    <>
      {isDirty ? <BeforeUnloadWarning /> : null}
      <ConfirmDialog
        isOpen={isNavigationBlocked}
        title="Discard unsaved form changes?"
        message={
          isSubmissionPending
            ? 'A save is in progress. Wait for it to finish before leaving this page.'
            : 'These edits have not been saved or kept in the local buffer. Leaving this page will permanently discard them.'
        }
        confirmLabel="Discard and leave"
        cancelLabel="Keep editing"
        isConfirmDisabled={isSubmissionPending}
        onCancel={onCancelNavigation}
        onConfirm={onConfirmNavigation}
      />
    </>
  )
}
