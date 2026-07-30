import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { isPotentiallyCommittedMutationError } from '../../api/api-error'
import {
  createResource,
  deleteResource,
  getResource,
  listResources,
  provisionResource,
  replaceResource,
  updateBasicInfo,
  updateProjectDetails,
} from './api/resources.api'
import type {
  BasicInfo,
  ProjectDetails,
  Resource,
  ResourceListParams,
  ResourcePayload,
} from './api/resources.types'

export const resourceKeys = {
  all: ['resources'] as const,
  lists: () => [...resourceKeys.all, 'list'] as const,
  list: (params: ResourceListParams) => [...resourceKeys.lists(), params] as const,
  details: () => [...resourceKeys.all, 'detail'] as const,
  detail: (resourceId: string | number) =>
    [...resourceKeys.details(), String(resourceId)] as const,
}

export function useResources(params: ResourceListParams) {
  return useQuery({
    queryKey: resourceKeys.list(params),
    queryFn: ({ signal }) => listResources(params, signal),
    placeholderData: keepPreviousData,
  })
}

export function useResource(resourceId: string | undefined) {
  return useQuery({
    queryKey: resourceKeys.detail(resourceId ?? ''),
    queryFn: ({ signal }) => getResource(resourceId!, signal),
    enabled: Boolean(resourceId),
  })
}

export function useCreateResource() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createResource,
    onSuccess: (resource) => {
      queryClient.setQueryData(resourceKeys.detail(resource.resourceId), resource)
      void queryClient.invalidateQueries({ queryKey: resourceKeys.lists() })
    },
    onError: (error) => {
      if (isPotentiallyCommittedMutationError(error)) {
        void queryClient.invalidateQueries({
          queryKey: resourceKeys.lists(),
        })
      }
    },
  })
}

export function useDeleteResource() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteResource,
    onSuccess: (resource) => {
      queryClient.removeQueries({
        queryKey: resourceKeys.detail(resource.resourceId),
      })
      void queryClient.invalidateQueries({ queryKey: resourceKeys.lists() })
    },
    onError: (error, resourceId) => {
      if (!isPotentiallyCommittedMutationError(error)) {
        return
      }

      void queryClient.invalidateQueries({
        queryKey: resourceKeys.detail(resourceId),
      })
    },
  })
}

function useResourceUpdateMutation<TVariables extends { resourceId: string }>(
  mutationFn: (variables: TVariables) => Promise<Resource>,
  { invalidateDetailOnError = true }: { invalidateDetailOnError?: boolean } = {},
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn,
    onSuccess: (resource) => {
      queryClient.setQueryData(resourceKeys.detail(resource.resourceId), resource)
      void queryClient.invalidateQueries({ queryKey: resourceKeys.lists() })
    },
    onError: (error, variables) => {
      if (!isPotentiallyCommittedMutationError(error)) {
        return
      }

      if (invalidateDetailOnError) {
        void queryClient.invalidateQueries({
          queryKey: resourceKeys.detail(variables.resourceId),
          refetchType: 'none',
        })
      }
      void queryClient.invalidateQueries({ queryKey: resourceKeys.lists() })
    },
  })
}

export function useUpdateBasicInfo() {
  return useResourceUpdateMutation(
    ({ resourceId, basicInfo }: { resourceId: string; basicInfo: BasicInfo }) =>
      updateBasicInfo(resourceId, basicInfo),
  )
}

export function useUpdateProjectDetails() {
  return useResourceUpdateMutation(
    ({
      resourceId,
      projectDetails,
    }: {
      resourceId: string
      projectDetails: ProjectDetails
    }) => updateProjectDetails(resourceId, projectDetails),
  )
}

export function useProvisionResource() {
  return useResourceUpdateMutation(
    ({ resourceId }: { resourceId: string }) => provisionResource(resourceId),
    { invalidateDetailOnError: false },
  )
}

export function useReplaceResource() {
  return useResourceUpdateMutation(
    ({ resourceId, payload }: { resourceId: string; payload: ResourcePayload }) =>
      replaceResource(resourceId, payload),
    { invalidateDetailOnError: false },
  )
}
