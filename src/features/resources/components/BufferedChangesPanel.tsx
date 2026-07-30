import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { Badge, Card } from '../../../design-system'
import type { BufferedResourceSummary } from '../edit-buffer/edit-buffer.context'

interface BufferedChangesPanelProps {
  resources: BufferedResourceSummary[]
}

const Panel = styled(Card)`
  display: grid;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  border-color: ${({ theme }) => theme.colors.warning};
`

const HeadingRow = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm};
`

const Heading = styled.h2`
  margin: 0;
  font-size: 1.1rem;
`

const Description = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.inkMuted};
`

const ResourceLinks = styled.ul`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm};
  margin: 0;
  padding: 0;
  list-style: none;
`

const ResourceLink = styled(Link)`
  display: inline-flex;
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
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

export function BufferedChangesPanel({ resources }: BufferedChangesPanelProps) {
  if (resources.length === 0) {
    return null
  }

  const headingId = 'buffered-resources-heading'

  return (
    <Panel as="section" aria-labelledby={headingId}>
      <HeadingRow>
        <Heading id={headingId}>Unsaved local changes</Heading>
        <Badge variant="warning">{resources.length}</Badge>
      </HeadingRow>
      <Description>
        These completed resources have temporary changes in this browser tab. Review and
        submit them before refreshing or closing the app.
      </Description>
      <ResourceLinks>
        {resources.map((resource) => (
          <li key={resource.resourceId}>
            <ResourceLink to={`/resources/${resource.resourceId}`}>
              {resource.name} — Review
            </ResourceLink>
          </li>
        ))}
      </ResourceLinks>
    </Panel>
  )
}
