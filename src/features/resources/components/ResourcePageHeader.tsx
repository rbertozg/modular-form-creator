import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import type { Resource } from '../api/resources.types'
import { ResourceStatusBadge } from './ResourceStatusBadge'

const Header = styled.header`
  display: grid;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`

const BackLink = styled(Link)`
  width: fit-content;
  color: ${({ theme }) => theme.colors.primaryStrong};
  font-weight: 600;
`

const MainRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.lg};

  @media (max-width: 680px) {
    flex-direction: column;
  }
`

const TitleGroup = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.xs};
`

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm};
`

const Title = styled.h1`
  margin: 0;
  font-family: ${({ theme }) => theme.typography.heading};
`

const Subtitle = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.inkMuted};
`

const Actions = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm};
`

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
