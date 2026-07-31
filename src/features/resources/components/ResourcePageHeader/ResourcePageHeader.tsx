import type { ReactNode } from 'react'
import type { Resource } from '../../api/resources.types'
import { ResourceStatusBadge } from '../ResourceStatusBadge'
import {
  Actions,
  BackLink,
  Header,
  MainRow,
  Subtitle,
  Title,
  TitleGroup,
  TitleRow,
} from './ResourcePageHeader.styles'

interface ResourcePageHeaderProps {
  resource: Resource
  title?: string
  subtitle?: string
  backTo?: string
  backLabel?: string
  actions?: ReactNode
}

export function ResourcePageHeader({
  resource,
  title = resource.name,
  subtitle = `Resource #${resource.resourceId}`,
  backTo = '/resources',
  backLabel = '← Back to resources',
  actions,
}: ResourcePageHeaderProps) {
  return (
    <Header>
      <BackLink to={backTo}>{backLabel}</BackLink>
      <MainRow>
        <TitleGroup>
          <TitleRow>
            <Title>{title}</Title>
            <ResourceStatusBadge status={resource.status} />
          </TitleRow>
          <Subtitle>{subtitle}</Subtitle>
        </TitleGroup>
        {actions ? <Actions>{actions}</Actions> : null}
      </MainRow>
    </Header>
  )
}
