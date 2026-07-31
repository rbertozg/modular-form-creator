import { Badge, Button } from '../../../../design-system'
import type { Resource } from '../../api/resources.types'
import {
  isBasicInfoComplete,
  isProjectDetailsComplete,
} from '../../domain/resource.rules'
import { ResourceStatusBadge } from '../ResourceStatusBadge'
import {
  Actions,
  Info,
  Item,
  Meta,
  OpenLink,
  ResourceLink,
  TitleRow,
} from './ResourceListItem.styles'

interface ResourceListItemProps {
  resource: Resource
  hasUnsavedChanges?: boolean
  onDelete: (resource: Resource) => void
}

export function ResourceListItem({
  resource,
  hasUnsavedChanges = false,
  onDelete,
}: ResourceListItemProps) {
  const completedModules = [
    isBasicInfoComplete(resource.basicInfo),
    isProjectDetailsComplete(resource.projectDetails),
  ].filter(Boolean).length

  return (
    <Item>
      <Info>
        <TitleRow>
          <ResourceLink to={`/resources/${resource.resourceId}`}>
            {resource.name}
          </ResourceLink>
          <ResourceStatusBadge status={resource.status} />
          {hasUnsavedChanges ? <Badge variant="warning">Unsaved changes</Badge> : null}
        </TitleRow>
        <Meta>
          Resource #{resource.resourceId} · {completedModules}/2 modules complete
        </Meta>
      </Info>
      <Actions>
        <OpenLink to={`/resources/${resource.resourceId}`}>Open</OpenLink>
        <Button
          type="button"
          size="small"
          variant="ghost"
          onClick={() => onDelete(resource)}
        >
          Delete
        </Button>
      </Actions>
    </Item>
  )
}
