import { useState, useCallback, useEffect } from 'react'
import { parsePath, pathForView, routeForNavId } from '../lib/routes'

export function useAppRouter() {
  const [currentView, setCurrentView] = useState(() => parsePath(window.location.pathname).currentView)
  const [activeNav, setActiveNav] = useState(() => parsePath(window.location.pathname).activeNav)

  const applyRoute = useCallback((view, nav, { replace = false } = {}) => {
    setCurrentView(view)
    setActiveNav(nav)
    const path = pathForView(view, nav)
    if (window.location.pathname !== path) {
      const method = replace ? 'replaceState' : 'pushState'
      window.history[method](null, '', path)
    }
  }, [])

  const handleNavSelect = useCallback(
    (navId) => {
      const { currentView: view, activeNav: nav } = routeForNavId(navId)
      applyRoute(view, nav)
    },
    [applyRoute],
  )

  const navigateToInbox = useCallback(() => {
    applyRoute('inbox', activeNav)
  }, [applyRoute, activeNav])

  const navigateToMain = useCallback(() => {
    applyRoute('main', 'portfolio')
  }, [applyRoute])

  useEffect(() => {
    const onPopState = () => {
      const { currentView: view, activeNav: nav } = parsePath(window.location.pathname)
      setCurrentView(view)
      setActiveNav(nav)
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  return {
    currentView,
    activeNav,
    handleNavSelect,
    navigateToInbox,
    navigateToMain,
  }
}
