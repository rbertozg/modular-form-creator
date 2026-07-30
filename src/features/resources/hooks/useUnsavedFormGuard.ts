import { useCallback, useLayoutEffect, useRef } from 'react'
import { useBlocker, type BlockerFunction } from 'react-router-dom'

export function useUnsavedFormGuard(isDirty: boolean) {
  const bypassNextNavigation = useRef(false)
  const shouldBlock = useCallback<BlockerFunction>(
    ({ currentLocation, nextLocation }) =>
      isDirty &&
      !bypassNextNavigation.current &&
      currentLocation.pathname !== nextLocation.pathname,
    [isDirty],
  )
  const blocker = useBlocker(shouldBlock)
  const blockerRef = useRef(blocker)

  useLayoutEffect(() => {
    blockerRef.current = blocker
  }, [blocker])

  const cancelNavigation = useCallback(() => {
    if (blocker.state === 'blocked') {
      blocker.reset()
    }
  }, [blocker])

  const confirmNavigation = useCallback(() => {
    if (blocker.state === 'blocked') {
      blocker.proceed()
    }
  }, [blocker])

  const navigateWithoutBlocking = useCallback((navigate: () => void) => {
    bypassNextNavigation.current = true
    const currentBlocker = blockerRef.current

    if (currentBlocker.state === 'blocked') {
      currentBlocker.proceed()
    } else {
      navigate()
    }

    queueMicrotask(() => {
      bypassNextNavigation.current = false
    })
  }, [])

  return {
    cancelNavigation,
    confirmNavigation,
    isNavigationBlocked: blocker.state === 'blocked',
    navigateWithoutBlocking,
  }
}
