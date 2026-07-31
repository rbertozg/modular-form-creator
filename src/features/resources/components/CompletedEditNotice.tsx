import { AlertMessage } from '../../../components/AlertMessage/AlertMessage'

export function CompletedEditNotice() {
  return (
    <AlertMessage>
      Saving this form keeps changes only in this browser tab. Submit all changes from the
      resource overview to persist them.
    </AlertMessage>
  )
}
