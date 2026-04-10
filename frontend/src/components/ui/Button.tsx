import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  fullWidth?: boolean
}

export default function Button({ children, fullWidth = false, className = '', ...props }: Props) {
  return (
    <button
      className={`rounded-2xl px-4 py-3 font-medium transition-all duration-200
      bg-blue-600 hover:bg-blue-500 active:scale-[0.99]
      shadow-lg shadow-blue-600/25 disabled:opacity-60 disabled:cursor-not-allowed
      ${fullWidth ? 'w-full' : ''}
      ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}