import './GraphControlPanel.css';

const PANEL_LABELS = {
  code: 'Code',
  map: 'Map',
  layers: 'Layers',
  data: 'Data Platform',
};

export default function SidePanelPlaceholder({ activeNav }) {
  const label = PANEL_LABELS[activeNav] ?? 'View';

  return (
    <div className="h-full flex flex-col border-r border-[var(--app-border)] bg-[color-mix(in_srgb,var(--app-panel-bg)_72%,transparent)] backdrop-blur-md p-6 text-left">
      <p className="gcp-footer-meta m-0 text-[0.625rem] uppercase tracking-wider text-[var(--app-accent)]">
        Coming soon
      </p>
      <h3 className="mt-2 mb-0 text-sm font-semibold text-[var(--app-text)]">{label}</h3>
      <p className="mt-3 text-sm leading-relaxed text-[var(--app-text-muted)]">
        This view is not in the prototype yet. Select the portfolio icon in the sidebar to
        return to the graph explorer.
      </p>
    </div>
  );
}
