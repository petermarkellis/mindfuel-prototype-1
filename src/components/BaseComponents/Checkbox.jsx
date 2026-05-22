import React from 'react'

const Checkbox = ({ className = '', checked, onChange, ...props }) => (
  <label className={`inline-flex items-center cursor-pointer ${className}`}>
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="sr-only peer"
      {...props}
    />
    <span
      className="inline-flex h-4 w-4 items-center justify-center rounded bg-[#355555] transition-all peer-focus-visible:ring-2 peer-focus-visible:ring-blue-300"
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 24 24"
        className={`h-3 w-3 stroke-white stroke-[3] fill-none ${checked ? 'visible' : 'invisible'}`}
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
    </span>
  </label>
)

export default Checkbox
