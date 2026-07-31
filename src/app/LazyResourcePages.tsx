import { Suspense, lazy, type ReactNode } from 'react'
import { LoadingState } from '../components/PageState/PageState'

const ResourcesPage = lazy(() =>
  import('../features/resources/pages/ResourcesPage/ResourcesPage').then((module) => ({
    default: module.ResourcesPage,
  })),
)
const ResourceOverviewPage = lazy(() =>
  import('../features/resources/pages/ResourceOverviewPage/ResourceOverviewPage').then(
    (module) => ({
      default: module.ResourceOverviewPage,
    }),
  ),
)
const ResourceDetailsPage = lazy(() =>
  import('../features/resources/pages/ResourceDetailsPage/ResourceDetailsPage').then(
    (module) => ({
      default: module.ResourceDetailsPage,
    }),
  ),
)
const BasicInfoPage = lazy(() =>
  import('../features/resources/pages/BasicInfoPage/BasicInfoPage').then((module) => ({
    default: module.BasicInfoPage,
  })),
)
const ProjectDetailsPage = lazy(() =>
  import('../features/resources/pages/ProjectDetailsPage/ProjectDetailsPage').then(
    (module) => ({
      default: module.ProjectDetailsPage,
    }),
  ),
)
const NotFoundPage = lazy(() =>
  import('../features/resources/pages/NotFoundPage/NotFoundPage').then((module) => ({
    default: module.NotFoundPage,
  })),
)

function PageBoundary({ children, label }: { children: ReactNode; label: string }) {
  return <Suspense fallback={<LoadingState label={label} />}>{children}</Suspense>
}

export function LazyResourcesPage() {
  return (
    <PageBoundary label="Loading resources page">
      <ResourcesPage />
    </PageBoundary>
  )
}

export function LazyResourceOverviewPage() {
  return (
    <PageBoundary label="Loading resource overview">
      <ResourceOverviewPage />
    </PageBoundary>
  )
}

export function LazyResourceDetailsPage() {
  return (
    <PageBoundary label="Loading resource summary">
      <ResourceDetailsPage />
    </PageBoundary>
  )
}

export function LazyBasicInfoPage() {
  return (
    <PageBoundary label="Loading Basic Info">
      <BasicInfoPage />
    </PageBoundary>
  )
}

export function LazyProjectDetailsPage() {
  return (
    <PageBoundary label="Loading Project Details">
      <ProjectDetailsPage />
    </PageBoundary>
  )
}

export function LazyNotFoundPage() {
  return (
    <PageBoundary label="Loading page">
      <NotFoundPage />
    </PageBoundary>
  )
}
