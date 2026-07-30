import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { Badge, Button, Card } from '../../../design-system'
import type { Resource } from '../api/resources.types'
import { isBasicInfoComplete, isProjectDetailsComplete } from '../resource.rules'
import { ResourceStatusBadge } from './ResourceStatusBadge'

interface ResourceListItemProps {
  resource: Resource
  hasUnsavedChanges?: boolean
  onDelete: (resource: Resource) => void
}

const Item = styled(Card)`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: ${({ theme }) => theme.spacing.lg};
  align-items: center;
  padding: ${({ theme }) => theme.spacing.lg};

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`

const Info = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.sm};
  min-width: 0;
`

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm};
`

const ResourceLink = styled(Link)`
  overflow: hidden;
  color: ${({ theme }) => theme.colors.inkStrong};
  font-family: ${({ theme }) => theme.typography.heading};
  font-size: 1.15rem;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const Meta = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.inkMuted};
`

const Actions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
`

const OpenLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 36px;
  padding: 0 ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.sm};
  color: ${({ theme }) => theme.colors.inkStrong};
  font-weight: 600;
  text-decoration: none;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
  }

  &:focus-visible {
    outline: 3px solid ${({ theme }) => theme.colors.accentSoft};
    outline-offset: 2px;
  }
`

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
