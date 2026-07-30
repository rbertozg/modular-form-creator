import { Badge } from '../../../design-system'
import type { ResourceStatus } from '../api/resources.types'

export function ResourceStatusBadge({ status }: { status: ResourceStatus }) {
  return (
    <Badge variant={status === 'completed' ? 'success' : 'warning'}>
      {status === 'completed' ? 'Completed' : 'Draft'}
    </Badge>
  )
}
