import ThemeToggle from './ThemeToggle'
import ResetViewButton from './ResetViewButton'
import PortfolioViewToggle from './PortfolioViewToggle'

export default function AppHeader({
  title = 'Portfolio Overview',
  onResetView,
  resetDisabled = false,
  showResetView = true,
  portfolioView = 'graph',
  onPortfolioViewChange,
  showPortfolioViewToggle = false,
}) {
  return (
    <header className="fixed top-0 left-16 right-0 z-[60] h-10 flex items-center justify-between gap-4 border-b border-[var(--app-border-subtle)] bg-[var(--app-chrome-bg)] px-4">
      <p className="m-0 text-sm font-semibold leading-none text-[var(--app-text)] truncate">
        {title}
      </p>
      <div className="flex items-center gap-2 flex-shrink-0">
        {showPortfolioViewToggle && onPortfolioViewChange && (
          <PortfolioViewToggle
            mode={portfolioView}
            onChange={onPortfolioViewChange}
            disabled={resetDisabled}
          />
        )}
        {showResetView && onResetView && (
          <ResetViewButton onReset={onResetView} disabled={resetDisabled} />
        )}
        <ThemeToggle />
      </div>
    </header>
  )
}
