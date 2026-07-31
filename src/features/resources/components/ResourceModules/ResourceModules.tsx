import type { Resource } from '../../api/resources.types'
import {
  canAccessProjectDetails,
  isBasicInfoComplete,
  isProjectDetailsComplete,
} from '../../domain/resource.rules'
import { ModuleCard } from '../ModuleCard/ModuleCard'
import { Modules } from './ResourceModules.styles'

export function ResourceModules({ resource }: { resource: Resource }) {
  const basicComplete = isBasicInfoComplete(resource.basicInfo)
  const projectComplete = isProjectDetailsComplete(resource.projectDetails)

  return (
    <Modules aria-label="Resource modules">
      <ModuleCard
        title="Basic Info"
        description="Resource owner, contact details, priority, and description."
        isComplete={basicComplete}
        to={`/resources/${resource.resourceId}/basic-info`}
      />
      <ModuleCard
        title="Project Details"
        description="Project identity, budget, category, and assigned team."
        isComplete={projectComplete}
        isLocked={!canAccessProjectDetails(resource)}
        to={`/resources/${resource.resourceId}/project-details`}
      />
    </Modules>
  )
}
