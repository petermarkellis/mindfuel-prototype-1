import './GraphControlPanel.css';

export default function GraphControlPanel_Action({ title, onClick, isSelected = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`gcp-list__btn w-full truncate px-2 py-1.5 rounded-md text-left text-sm transition-colors duration-150 ${
        isSelected ? 'gcp-list__btn--selected' : ''
      }`}
      title={title}
    >
      {title}
    </button>
  );
}
