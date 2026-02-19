import { Icon } from '@iconify/react'

type Props = {
  count: number
}

export function PlanningWarningsBadge({ count }: Props) {
  if (count <= 0) return null

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-brand-gold/20 px-2 py-0.5 text-[11px] font-semibold text-brand-dark">
      <Icon icon="mdi:alert-circle-outline" className="text-sm" />
      {count}
    </span>
  )
}
