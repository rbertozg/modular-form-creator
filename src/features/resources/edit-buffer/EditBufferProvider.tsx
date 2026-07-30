import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  type PropsWithChildren,
} from 'react'
import type { BasicInfo, ProjectDetails, Resource } from '../api/resources.types'
import { EditBufferContext, type EditBufferContextValue } from './edit-buffer.context'
import { editBufferReducer } from './edit-buffer.reducer'

export function EditBufferProvider({ children }: PropsWithChildren) {
  const [state, dispatch] = useReducer(editBufferReducer, {})

  const dirtyResources = useMemo(
    () =>
      Object.entries(state)
        .filter(([, entry]) => entry.isDirty)
        .map(([resourceId, entry]) => ({
          resourceId,
          name: entry.payload.name,
        }))
        .sort((left, right) => left.name.localeCompare(right.name)),
    [state],
  )
  const hasDirtyResources = dirtyResources.length > 0

  const getEntry = useCallback(
    (resourceId: string | number) => state[String(resourceId)],
    [state],
  )

  const updateBasicInfo = useCallback((resource: Resource, basicInfo: BasicInfo) => {
    dispatch({ type: 'updateBasicInfo', resource, basicInfo })
  }, [])

  const updateProjectDetails = useCallback(
    (resource: Resource, projectDetails: ProjectDetails) => {
      dispatch({ type: 'updateProjectDetails', resource, projectDetails })
    },
    [],
  )

  const clear = useCallback((resourceId: string | number) => {
    dispatch({ type: 'clear', resourceId })
  }, [])

  useEffect(() => {
    if (!hasDirtyResources) {
      return
    }

    const warnAboutUnsavedChanges = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = true
    }

    window.addEventListener('beforeunload', warnAboutUnsavedChanges)
    return () => window.removeEventListener('beforeunload', warnAboutUnsavedChanges)
  }, [hasDirtyResources])

  const value = useMemo<EditBufferContextValue>(
    () => ({
      dirtyResources,
      getEntry,
      updateBasicInfo,
      updateProjectDetails,
      clear,
    }),
    [clear, dirtyResources, getEntry, updateBasicInfo, updateProjectDetails],
  )

  return <EditBufferContext.Provider value={value}>{children}</EditBufferContext.Provider>
}
