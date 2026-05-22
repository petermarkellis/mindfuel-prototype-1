import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

const STORAGE_KEY = 'mindfuel-theme'

const ThemeContext = createContext(null)

function getSystemTheme() {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function resolveTheme(mode) {
  return mode === 'system' ? getSystemTheme() : mode
}

const THEME_TRANSITION_MS = 400

function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

function runThemeTransition(updateDOM) {
  const root = document.documentElement

  if (prefersReducedMotion()) {
    updateDOM()
    return
  }

  const finish = () => {
    window.setTimeout(() => root.classList.remove('theme-transition'), THEME_TRANSITION_MS)
  }

  root.classList.add('theme-transition')

  if (typeof document.startViewTransition === 'function') {
    const transition = document.startViewTransition(() => {
      updateDOM()
    })
    transition?.finished.then(finish).catch(finish)
    return
  }

  updateDOM()
  finish()
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored === 'light' || stored === 'dark' || stored === 'system') return stored
    } catch {
      /* ignore */
    }
    return 'system'
  })

  const [resolvedTheme, setResolvedTheme] = useState(() => resolveTheme(theme))

  const applyTheme = useCallback((mode) => {
    const resolved = resolveTheme(mode)
    runThemeTransition(() => {
      setResolvedTheme(resolved)
      document.documentElement.classList.toggle('dark', resolved === 'dark')
      document.documentElement.style.colorScheme = resolved
    })
  }, [])

  useEffect(() => {
    applyTheme(theme)
  }, [theme, applyTheme])

  useEffect(() => {
    if (theme !== 'system') return undefined

    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => applyTheme('system')

    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [theme, applyTheme])

  const setTheme = useCallback((mode) => {
    setThemeState(mode)
    try {
      localStorage.setItem(STORAGE_KEY, mode)
    } catch {
      /* ignore */
    }
  }, [])

  const value = useMemo(
    () => ({ theme, resolvedTheme, setTheme }),
    [theme, resolvedTheme, setTheme]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}
