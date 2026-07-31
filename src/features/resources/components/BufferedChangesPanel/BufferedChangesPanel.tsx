import { Badge } from '../../../../design-system'
import type { BufferedResourceSummary } from '../../edit-buffer/edit-buffer.context'
import {
  Description,
  Heading,
  HeadingRow,
  Panel,
  ResourceLink,
  ResourceLinks,
} from './BufferedChangesPanel.styles'

interface BufferedChangesPanelProps {
  resources: BufferedResourceSummary[]
}

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
