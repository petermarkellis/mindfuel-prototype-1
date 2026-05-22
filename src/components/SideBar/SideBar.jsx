import React from 'react';
import './SideBar.css';
import { useTheme } from '../../theme/ThemeContext';
import {
  CodeBracketSquareIcon,
  MapIcon,
  Square3Stack3DIcon,
  ArrowLeftEndOnRectangleIcon,
} from '@heroicons/react/24/outline';
import {
  IconInbox,
  IconSquareRoundedPlus,
  IconRouteScan,
  IconBrandDatabricks,
} from '@tabler/icons-react';

const COMING_SOON_NAV = new Set(['code', 'map', 'layers', 'data']);

function navButtonClass(isActive) {
  return `side-nav__btn rounded-xl p-1 border transition-colors duration-200 cursor-pointer ${
    isActive
      ? 'side-nav__btn--active'
      : 'bg-transparent border-transparent hover:border-[var(--app-border)] hover:bg-[var(--app-surface-muted)]'
  }`;
}

function navIconClass(isActive) {
  return `size-6 ${isActive ? 'text-[var(--app-accent)]' : 'text-[var(--app-text-muted)]'}`;
}

export default function SideNav({
  onOpenNewItemModal,
  onNavigateToMain,
  onNavSelect,
  isMainView = true,
  currentView = 'main',
  activeNav = 'portfolio',
}) {
  const { resolvedTheme } = useTheme();
  const logoSrc =
    resolvedTheme === 'dark' ? '/mindfuel_logo.svg' : '/mindfuel_logo_light.svg';

  const handleNavClick = (navId) => {
    onNavSelect?.(navId);
  };

  const isNavActive = (navId) => {
    if (navId === 'inbox') return currentView === 'inbox';
    return currentView === 'main' && activeNav === navId;
  };

  const renderNavItem = (navId, label, IconComponent) => {
    const active = isNavActive(navId);
    const soon = COMING_SOON_NAV.has(navId);

    return (
      <li className="relative" key={navId}>
        <button
          type="button"
          onClick={() => handleNavClick(navId)}
          className={navButtonClass(active)}
          aria-label={label}
          title={soon ? `${label} (coming soon)` : label}
        >
          <IconComponent className={navIconClass(active)} strokeWidth={2} />
          {navId === 'inbox' ? (
            <span
              className="w-2 h-2 rounded-full absolute bottom-1 right-1 bg-[var(--app-accent)]"
              aria-hidden
            />
          ) : null}
        </button>
      </li>
    );
  };

  return (
    <nav className="side-nav fixed top-0 left-0 z-[100] w-16 h-screen border-r border-[var(--app-border-subtle)] bg-[var(--app-chrome-bg)] flex flex-col pointer-events-auto">
      <div className="flex flex-col items-center w-full py-2">
        <button
          type="button"
          onClick={() => handleNavClick('portfolio')}
          className="p-2 rounded-lg hover:bg-[var(--app-surface-muted)] transition-colors duration-200 cursor-pointer"
          aria-label="Go to portfolio view"
        >
          <img src={logoSrc} alt="Mindfuel Logo" className="w-6" />
        </button>
      </div>

      <div className="flex-1 flex flex-col">
        <ul className="w-16 flex flex-col items-center mt-4 gap-6">
          {renderNavItem('inbox', 'Open inbox', IconInbox)}
          {renderNavItem('portfolio', 'Portfolio graph view', IconRouteScan)}
          {renderNavItem('code', 'Code view', CodeBracketSquareIcon)}
          {renderNavItem('map', 'Map view', MapIcon)}
          {renderNavItem('layers', 'Layers view', Square3Stack3DIcon)}
          {renderNavItem('data', 'Data platform view', IconBrandDatabricks)}
        </ul>
      </div>

      <div className="w-16 flex flex-col items-center pb-4 gap-3">
        {isMainView ? (
          <button
            type="button"
            onClick={onOpenNewItemModal}
            className="side-nav__btn rounded-xl p-1 border border-[var(--app-border)] bg-[var(--app-surface)] hover:bg-[var(--app-surface-muted)] transition-colors duration-200 cursor-pointer"
            aria-label="Create new item"
          >
            <IconSquareRoundedPlus
              className="size-6 text-[var(--app-text-muted)]"
              strokeWidth={2}
            />
          </button>
        ) : null}
        <button
          type="button"
          onClick={() => {
            sessionStorage.removeItem('mindfuel_auth');
            sessionStorage.removeItem('mindfuel_initial_load_done');
            window.location.reload();
          }}
          className="side-nav__btn rounded-xl p-1 border border-[var(--app-border)] bg-[var(--app-surface)] hover:bg-[var(--app-danger-bg)] hover:border-[var(--app-danger-border)] transition-colors duration-200 cursor-pointer"
          aria-label="Logout"
          title="Logout"
        >
          <ArrowLeftEndOnRectangleIcon
            className="size-6 text-[var(--app-text-muted)] hover:text-[var(--app-danger-text)]"
            strokeWidth={2}
          />
        </button>
      </div>
    </nav>
  );
}
