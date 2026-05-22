import { IconDeviceDesktop, IconMoon, IconSun } from '@tabler/icons-react'
import { useTheme } from '../../theme/ThemeContext'

const options = [
  { id: 'light', label: 'Light theme', Icon: IconSun },
  { id: 'dark', label: 'Dark theme', Icon: IconMoon },
  { id: 'system', label: 'System theme', Icon: IconDeviceDesktop },
]

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <div
      className="flex items-center gap-0.5 rounded-lg border border-[var(--app-border)] bg-[var(--app-surface-muted)] p-0.5"
      role="group"
      aria-label="Theme"
    >
      {options.map(({ id, label, Icon }) => {
        const active = theme === id
        return (
          <button
            key={id}
            type="button"
            onClick={() => setTheme(id)}
            title={label}
            aria-label={label}
            aria-pressed={active}
            className={`rounded-md p-1.5 transition-colors ${
              active
                ? 'bg-[var(--app-surface)] text-[var(--app-text)] shadow-sm'
                : 'text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-surface)]/60'
            }`}
          >
            <Icon className="w-4 h-4" stroke={1.75} />
          </button>
        )
      })}
    </div>
  )
}
