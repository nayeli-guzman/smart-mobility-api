import type { InputHTMLAttributes } from 'react'

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label: string
}

export default function Input({ label, className = '', ...props }: Props) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm text-slate-300">{label}</span>
      <input
        className={`rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none
        focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 placeholder:text-slate-500
        ${className}`}
        {...props}
      />
    </label>
  )
}