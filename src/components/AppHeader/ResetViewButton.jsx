import { IconRefresh } from '@tabler/icons-react'
import OutlineButton from '../BaseComponents/OutlineButton'
import { useResetPortfolioView } from '../../hooks/useResetPortfolioView'

export default function ResetViewButton({ onReset, disabled = false }) {
  const { openConfirm, resetting, confirmModal } = useResetPortfolioView(onReset)

  return (
    <>
      <OutlineButton
        type="button"
        onClick={openConfirm}
        disabled={disabled || resetting}
        title="Reset demo to original layout"
        aria-label="Reset Demo"
        className="!min-h-[2rem] !px-2.5 !text-xs gap-1.5"
      >
        <IconRefresh className={`w-4 h-4 ${resetting ? 'animate-spin' : ''}`} stroke={1.75} />
        Reset Demo
      </OutlineButton>
      {confirmModal}
    </>
  )
}
