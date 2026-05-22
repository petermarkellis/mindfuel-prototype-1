import { useState, useCallback } from 'react'
import ConfirmationModal from '../components/BaseComponents/ConfirmationModal'

export function useResetPortfolioView(onReset) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [resetError, setResetError] = useState(null)

  const openConfirm = useCallback(() => {
    setResetError(null)
    setConfirmOpen(true)
  }, [])

  const handleConfirm = useCallback(async () => {
    setResetting(true)
    setResetError(null)
    try {
      await onReset?.()
      setConfirmOpen(false)
    } catch (err) {
      setResetError(
        err?.message ?? 'Reset failed. Try running npm run dev:full and press Reset again.',
      )
    } finally {
      setResetting(false)
    }
  }, [onReset])

  const closeConfirm = useCallback(() => {
    if (!resetting) setConfirmOpen(false)
  }, [resetting])

  const confirmModal = (
    <ConfirmationModal
      isOpen={confirmOpen}
      onClose={closeConfirm}
      onConfirm={handleConfirm}
      title="Reset portfolio view?"
      message={
        resetError
          ? `Could not reset the graph.\n\n${resetError}\n\nIf you are developing locally, run npm run dev:full (or restart npm run dev:local) so the API includes the reset endpoint, then try again.`
          : 'This restores all nodes and connections to the original demo layout. Any nodes you added will be removed, and moved nodes will return to their starting positions.'
      }
      confirmText={resetting ? 'Resetting…' : 'Reset Demo'}
      cancelText="Cancel"
      variant={resetError ? 'danger' : 'warning'}
    />
  )

  return { openConfirm, resetting, confirmModal }
}
