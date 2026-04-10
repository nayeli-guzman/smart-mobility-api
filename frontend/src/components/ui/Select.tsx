import type { SelectHTMLAttributes } from 'react'

interface Props extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string
}

export default function Select({ label, className = '', children, ...props }: Props) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm text-slate-300">{label}</span>
      <select
        className={`rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 outline-none
        focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 ${className}`}
        {...props}
      >
        {children}
      </select>
    </label>
  )
}