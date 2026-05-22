const PANEL_LABELS = {
  code: 'Code',
  map: 'Map',
  layers: 'Layers',
  data: 'Data Platform',
}

export default function SidePanelPlaceholder({ activeNav }) {
  const label = PANEL_LABELS[activeNav] ?? 'View'

  return (
    <div className="h-full flex flex-col bg-[var(--app-surface)] border-r border-[var(--app-border)] p-4">
      <h3 className="m-0 text-sm font-semibold text-[var(--app-text)] select-none">{label}</h3>
      <p className="mt-3 text-sm text-[var(--app-text-muted)]">
        This view is not available in the prototype yet. Select the portfolio icon to return to the graph explorer.
      </p>
    </div>
  )
}
