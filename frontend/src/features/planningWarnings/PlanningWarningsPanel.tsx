import { Icon } from '@iconify/react'
import type { CircuitPlanningWarning } from './types'
import { warningKey } from './ignoredWarningsStore'
import { useIgnoredWarningKeys } from './useIgnoredWarnings'

type Props = {
  circuitId: number
  warnings: CircuitPlanningWarning[]
}

export function PlanningWarningsPanel({ circuitId, warnings }: Props) {
  const { keys, ignore } = useIgnoredWarningKeys()

  const visible = warnings.filter((w) => !keys.has(warningKey(circuitId, w)))

  if (visible.length === 0) return null

  return (
    <div className="card-sand p-4 space-y-3">
      <div className="flex items-start gap-2">
        <Icon icon="mdi:alert" className="mt-0.5 text-lg text-brand-gold" />
        <div className="flex-1">
          <div className="text-sm font-semibold text-brand-ocean">Planning warnings</div>
          <div className="text-xs text-gray-500">You can ignore these. They won’t block saving.</div>
        </div>
      </div>

      <div className="space-y-2">
        {visible.map((w) => {
          const key = warningKey(circuitId, w)
          const meta = [w.dayNumber != null ? `Day ${w.dayNumber}` : null, w.stopId != null ? `Stop ${w.stopId}` : null]
            .filter(Boolean)
            .join(' • ')

          return (
            <div key={key} className="flex items-start gap-3 rounded-xl bg-white p-3 border border-brand-gold/20">
              <div className="flex-1 min-w-0">
                <div className="text-sm text-gray-900">{w.message}</div>
                {meta ? <div className="mt-0.5 text-[11px] text-gray-400">{meta}</div> : null}
                <div className="mt-1 text-[11px] text-gray-500 font-mono">{w.code}</div>
              </div>
              <button
                onClick={() => ignore(key)}
                className="btn-ghost text-xs px-3 py-1"
                type="button"
              >
                Ignore
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
