import React from "react"
import "./SideBar.css"
import { useTheme } from '../../theme/ThemeContext'
import {
  CodeBracketSquareIcon,
  MapIcon,
  Square3Stack3DIcon,
  ArrowLeftEndOnRectangleIcon,
} from '@heroicons/react/24/outline'
import {
  IconInbox,
  IconSquareRoundedPlus,
  IconRouteScan,
  IconBrandDatabricks,
} from '@tabler/icons-react'

const activeStyles = {
  blue: 'bg-blue-500/15 border-blue-400 shadow-sm',
  green: 'bg-emerald-500/15 border-emerald-400 shadow-sm',
  slate: 'bg-[var(--app-surface-muted)] border-[var(--app-border)] shadow-sm',
}

const activeIconStyles = {
  blue: 'text-blue-400',
  green: 'text-emerald-400',
  slate: 'text-[var(--app-text)]',
}

function navButtonClass(isActive, color) {
  return `rounded-xl p-1 border transition-colors duration-300 cursor-pointer ${
    isActive
      ? activeStyles[color]
      : 'bg-transparent border-transparent hover:border-[var(--app-border)] hover:bg-[var(--app-surface-muted)]'
  }`
}

function navIconClass(isActive, color) {
  return `size-6 ${isActive ? activeIconStyles[color] : 'text-[var(--app-text-muted)]'}`
}

export default function SideNav({
  onOpenNewItemModal,
  onNavigateToMain,
  onNavSelect,
  isMainView = true,
  currentView = 'main',
  activeNav = 'portfolio',
}) {
  const { resolvedTheme } = useTheme()
  const logoSrc = resolvedTheme === 'dark' ? '/mindfuel_logo.svg' : '/mindfuel_logo_light.svg'

  const handleNavClick = (navId) => {
    onNavSelect?.(navId)
  }

  const isNavActive = (navId) => {
    if (navId === 'inbox') return currentView === 'inbox'
    return currentView === 'main' && activeNav === navId
  }

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
          <li className="relative">
            <button
              type="button"
              onClick={() => handleNavClick('inbox')}
              className={navButtonClass(isNavActive('inbox'), 'blue')}
              aria-label="Open inbox"
            >
              <IconInbox className={navIconClass(isNavActive('inbox'), 'blue')} strokeWidth={2} />
              <span className="w-2 h-2 bg-blue-500 rounded-full absolute bottom-1 right-1" />
            </button>
          </li>

          <li>
            <button
              type="button"
              onClick={() => handleNavClick('portfolio')}
              className={navButtonClass(isNavActive('portfolio'), 'green')}
              aria-label="Portfolio graph view"
            >
              <IconRouteScan className={navIconClass(isNavActive('portfolio'), 'green')} strokeWidth={2} />
            </button>
          </li>

          <li>
            <button
              type="button"
              onClick={() => handleNavClick('code')}
              className={navButtonClass(isNavActive('code'), 'slate')}
              aria-label="Code view"
            >
              <CodeBracketSquareIcon className={navIconClass(isNavActive('code'), 'slate')} strokeWidth={2} />
            </button>
          </li>

          <li>
            <button
              type="button"
              onClick={() => handleNavClick('map')}
              className={navButtonClass(isNavActive('map'), 'slate')}
              aria-label="Map view"
            >
              <MapIcon className={navIconClass(isNavActive('map'), 'slate')} strokeWidth={2} />
            </button>
          </li>

          <li>
            <button
              type="button"
              onClick={() => handleNavClick('layers')}
              className={navButtonClass(isNavActive('layers'), 'slate')}
              aria-label="Layers view"
            >
              <Square3Stack3DIcon className={navIconClass(isNavActive('layers'), 'slate')} strokeWidth={2} />
            </button>
          </li>

          <li>
            <button
              type="button"
              onClick={() => handleNavClick('data')}
              className={navButtonClass(isNavActive('data'), 'slate')}
              aria-label="Data platform view"
            >
              <IconBrandDatabricks className={navIconClass(isNavActive('data'), 'slate')} strokeWidth={2} />
            </button>
          </li>
        </ul>
      </div>

      <div className="w-16 flex flex-col items-center pb-4 gap-3">
        {isMainView && (
          <button
            type="button"
            onClick={onOpenNewItemModal}
            className="rounded-xl p-1 border border-[var(--app-border)] bg-[var(--app-surface)] hover:bg-[var(--app-surface-muted)] transition-colors duration-300 cursor-pointer"
            aria-label="Create new item"
          >
            <IconSquareRoundedPlus className="size-6 text-[var(--app-text-muted)]" strokeWidth={2} />
          </button>
        )}
        <button
          type="button"
          onClick={() => {
            sessionStorage.removeItem('mindfuel_auth')
            window.location.reload()
          }}
          className="rounded-xl p-1 border border-[var(--app-border)] bg-[var(--app-surface)] hover:bg-red-500/10 hover:border-red-400 transition-colors duration-300 cursor-pointer"
          aria-label="Logout"
          title="Logout"
        >
          <ArrowLeftEndOnRectangleIcon className="size-6 text-[var(--app-text-muted)] hover:text-red-400" strokeWidth={2} />
        </button>
      </div>
    </nav>
  )
}
