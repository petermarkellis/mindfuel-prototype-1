import { IconList, IconChartDots3 } from '@tabler/icons-react';
import './PortfolioViewToggle.css';

export default function PortfolioViewToggle({
  mode = 'graph',
  onChange,
  disabled = false,
}) {
  return (
    <div
      className="portfolio-view-toggle"
      role="group"
      aria-label="Portfolio view mode"
    >
      <button
        type="button"
        className={`portfolio-view-toggle__btn ${
          mode === 'graph' ? 'portfolio-view-toggle__btn--active' : ''
        }`}
        aria-pressed={mode === 'graph'}
        disabled={disabled}
        onClick={() => onChange?.('graph')}
        title="Graph view"
      >
        <IconChartDots3 size={16} stroke={1.75} />
        <span>Graph</span>
      </button>
      <button
        type="button"
        className={`portfolio-view-toggle__btn ${
          mode === 'list' ? 'portfolio-view-toggle__btn--active' : ''
        }`}
        aria-pressed={mode === 'list'}
        disabled={disabled}
        onClick={() => onChange?.('list')}
        title="List view"
      >
        <IconList size={16} stroke={1.75} />
        <span>List</span>
      </button>
    </div>
  );
}
