/** @typedef {'main' | 'inbox'} AppView */
/** @typedef {'portfolio' | 'code' | 'map' | 'layers' | 'data'} MainNavId */

/** @type {Record<string, { currentView: AppView, activeNav: MainNavId }>} */
const ROUTES = {
  '/': { currentView: 'main', activeNav: 'portfolio' },
  '/portfolio': { currentView: 'main', activeNav: 'portfolio' },
  '/inbox': { currentView: 'inbox', activeNav: 'portfolio' },
  '/code': { currentView: 'main', activeNav: 'code' },
  '/map': { currentView: 'main', activeNav: 'map' },
  '/layers': { currentView: 'main', activeNav: 'layers' },
  '/data': { currentView: 'main', activeNav: 'data' },
}

const DEFAULT_ROUTE = ROUTES['/']

/**
 * @param {string} pathname
 * @returns {{ currentView: AppView, activeNav: MainNavId }}
 */
export function parsePath(pathname) {
  const path = pathname.replace(/\/+$/, '') || '/'
  return ROUTES[path] ?? DEFAULT_ROUTE
}

/**
 * @param {AppView} currentView
 * @param {MainNavId} activeNav
 * @returns {string}
 */
export function pathForView(currentView, activeNav) {
  if (currentView === 'inbox') return '/inbox'
  if (activeNav === 'portfolio') return '/'
  return `/${activeNav}`
}

/**
 * @param {string} navId
 * @returns {{ currentView: AppView, activeNav: MainNavId }}
 */
export function routeForNavId(navId) {
  if (navId === 'inbox') {
    return { currentView: 'inbox', activeNav: 'portfolio' }
  }
  return { currentView: 'main', activeNav: navId }
}
