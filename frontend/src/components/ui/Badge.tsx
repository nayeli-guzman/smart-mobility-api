interface Props {
  children: string
}

export default function Badge({ children }: Props) {
  return (
    <span className="inline-flex rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-200">
      {children}
    </span>
  )
}