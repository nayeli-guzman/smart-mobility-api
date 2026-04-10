import Card from './Card'

interface Props {
  title: string
  value: string | number
  subtitle?: string
}

export default function StatCard({ title, value, subtitle }: Props) {
  return (
    <Card>
      <p className="text-sm text-slate-400">{title}</p>
      <h3 className="mt-3 text-3xl font-bold text-white">{value}</h3>
      {subtitle && <p className="mt-2 text-sm text-slate-300">{subtitle}</p>}
    </Card>
  )
}