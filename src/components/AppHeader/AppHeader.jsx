import ThemeToggle from './ThemeToggle'
import ResetViewButton from './ResetViewButton'

export default function AppHeader({
  title = 'Portfolio Overview',
  onResetView,
  resetDisabled = false,
  showResetView = true,
}) {
  return (
    <header className="fixed top-0 left-16 right-0 z-[60] h-10 flex items-center justify-between gap-4 border-b border-[var(--app-border-subtle)] bg-[var(--app-chrome-bg)] px-4">
      <p className="m-0 text-sm font-semibold leading-none text-[var(--app-text)] select-none truncate">
        {title}
      </p>
      <div className="flex items-center gap-2 flex-shrink-0">
        {showResetView && onResetView && (
          <ResetViewButton onReset={onResetView} disabled={resetDisabled} />
        )}
        <ThemeToggle />
      </div>
    </header>
  )
}
