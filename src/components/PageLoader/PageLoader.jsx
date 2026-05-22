import { useEffect, useRef, useState } from 'react'
import './PageLoader.css'

const MIN_LOADER_MS = 3000
const PAUSE_AT_100_MS = 500
const PROGRESS_TICK_MS = 48

let initialPageLoadComplete = false

export default function PageLoader({ isLoading, children }) {
  const [phase, setPhase] = useState(() => {
    if (initialPageLoadComplete) return 'done'
    return isLoading ? 'loading' : 'done'
  })
  const [progress, setProgress] = useState(0)
  const loaderStartedAt = useRef(Date.now())

  useEffect(() => {
    if (initialPageLoadComplete || !isLoading) return
    setPhase('loading')
    setProgress(0)
    loaderStartedAt.current = Date.now()
  }, [isLoading])

  useEffect(() => {
    if (phase !== 'loading') return

    const interval = setInterval(() => {
      const elapsed = Date.now() - loaderStartedAt.current
      const canComplete = !isLoading && elapsed >= MIN_LOADER_MS

      setProgress((p) => {
        if (canComplete) {
          if (p >= 100) return 100
          return Math.min(100, p + 2)
        }
        if (!isLoading && p >= 90) return p
        return p >= 88 ? p : p + 1
      })
    }, PROGRESS_TICK_MS)

    return () => clearInterval(interval)
  }, [phase, isLoading])

  useEffect(() => {
    if (phase === 'loading' && progress >= 100) {
      const t = setTimeout(() => setPhase('exiting'), PAUSE_AT_100_MS)
      return () => clearTimeout(t)
    }
  }, [phase, progress])

  const handleRevealEnd = (e) => {
    if (e.propertyName !== 'transform' || phase !== 'exiting') return
    initialPageLoadComplete = true
    setPhase('done')
  }

  const showOverlay = phase !== 'done'
  const showProgress = phase === 'loading' || phase === 'exiting'
  const showContent = phase === 'exiting' || phase === 'done'

  return (
    <>
      {showContent && (
        <div
          className={`page-loader__content min-h-screen w-full ${
            phase === 'exiting' ? 'page-loader__content--enter' : ''
          }`}
        >
          {children}
        </div>
      )}

      {showOverlay && (
        <>
          <div
            className={`fixed inset-0 z-[199] bg-[var(--app-bg)] ${
              phase === 'exiting' ? 'page-loader__backdrop--exit' : ''
            }`}
            aria-hidden
          />
          <div
            className="page-loader fixed inset-0 z-[200]"
            role="status"
            aria-live="polite"
            aria-busy={phase === 'loading'}
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className={`page-loader__panel ${phase === 'exiting' ? 'page-loader__panel--exit' : ''}`}
              onTransitionEnd={handleRevealEnd}
            >
              {showProgress && (
                <span className="page-loader__progress">
                  {String(progress).padStart(2, '0')}%
                </span>
              )}
            </div>
          </div>
        </>
      )}
    </>
  )
}
