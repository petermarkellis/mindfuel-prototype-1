import { IconRefresh } from '@tabler/icons-react'
import { useResetPortfolioView } from '../../hooks/useResetPortfolioView'

export default function ResetViewButton({ onReset, disabled = false }) {
  const { openConfirm, resetting, confirmModal } = useResetPortfolioView(onReset)

  return (
    <>
      <button
        type="button"
        onClick={openConfirm}
        disabled={disabled || resetting}
        title="Reset demo to original layout"
        aria-label="Reset Demo"
        className="flex items-center gap-1.5 rounded-lg border border-[var(--app-border)] bg-[var(--app-surface-muted)] px-2.5 py-1.5 text-xs font-medium text-[var(--app-text-muted)] transition-colors hover:bg-[var(--app-surface)] hover:text-[var(--app-text)] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <IconRefresh className={`w-4 h-4 ${resetting ? 'animate-spin' : ''}`} stroke={1.75} />
        Reset Demo
      </button>
      {confirmModal}
    </>
  )
}
