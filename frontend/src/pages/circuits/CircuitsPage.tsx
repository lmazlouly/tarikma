import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query'
import { useListCities1 } from '../../shared/api/city-controller/city-controller'
import type { CityResponse } from '../../shared/api/model'
import {
  createCircuit,
  listCircuitPlanningWarnings,
  listMyCircuits,
  type CircuitSummary,
} from '../../shared/api/circuits'
import { PlanningWarningsBadge } from '../../features/planningWarnings/PlanningWarningsBadge'
import { warningKey } from '../../features/planningWarnings/ignoredWarningsStore'
import { useIgnoredWarningKeys } from '../../features/planningWarnings/useIgnoredWarnings'
import { AiCircuitWizard } from '../../features/circuits/AiCircuitWizard'

function getPrimaryName(city: CityResponse) {
  const primary = (city.names ?? []).find((n) => n.primary)
  return primary?.name ?? (city.names ?? [])[0]?.name ?? '—'
}

export function CircuitsPage() {
  const queryClient = useQueryClient()
  const cities = useListCities1()
  const { keys } = useIgnoredWarningKeys()

  const [filterCityId, setFilterCityId] = useState<number | null>(null)
  const [newCircuitCityId, setNewCircuitCityId] = useState<number | null>(null)
  const [name, setName] = useState('')
  const [isFormExpanded, setIsFormExpanded] = useState(false)
  const [showAiWizard, setShowAiWizard] = useState(false)

  const circuitsQuery = useQuery({
    queryKey: ['my-circuits', filterCityId],
    queryFn: ({ signal }) => listMyCircuits(filterCityId ?? undefined, signal),
  })

  const circuits = (circuitsQuery.data ?? []) as CircuitSummary[]

  const warningsQueries = useQueries({
    queries: circuits.map((c) => ({
      queryKey: ['circuit-planning-warnings', c.id],
      queryFn: ({ signal }: { signal?: AbortSignal }) => listCircuitPlanningWarnings(c.id, signal),
      enabled: Boolean(c.id),
    })),
  })

  const createMutation = useMutation({
    mutationFn: ({ cityId, name }: { cityId: number; name: string }) =>
      createCircuit({ cityId, name, notes: null }),
    onSuccess: async () => {
      setName('')
      setNewCircuitCityId(null)
      setIsFormExpanded(false)
      await queryClient.invalidateQueries({ queryKey: ['my-circuits'] })
    },
  })

  const citiesOptions = useMemo(
    () => (cities.data ?? []).map((c) => ({ id: c.id!, name: getPrimaryName(c) })),
    [cities.data]
  )

  const handleCreate = () => {
    if (!newCircuitCityId) return
    const trimmed = name.trim()
    if (!trimmed) return
    createMutation.mutate({ cityId: newCircuitCityId, name: trimmed })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleCreate()
  }

  const isCreateDisabled = !newCircuitCityId || !name.trim() || createMutation.isPending

  return (
    <div className="circuits-page">
      {/* ── Page shell ── */}
      <div className="page-inner">

        {/* ── Header ── */}
        <header className="page-header">
          <Link to="/dashboard" className="back-btn" aria-label="Back to dashboard">
            <Icon icon="mdi:arrow-left" />
            <span>Dashboard</span>
          </Link>

          <div className="header-title-block">
            <h1 className="page-title">My Plans</h1>
            <p className="page-subtitle">Manage your travel circuits and resolve planning warnings.</p>
          </div>

          {/* Mobile: floating create button */}
          <button
            className="fab"
            aria-label="Create new plan"
            onClick={() => setIsFormExpanded((v) => !v)}
          >
            <Icon icon={isFormExpanded ? 'mdi:close' : 'mdi:plus'} />
          </button>
        </header>

        {/* ── Create form ── */}
        <section
          className={`create-card ${isFormExpanded ? 'create-card--open' : ''}`}
          aria-label="Create new plan"
        >
          <div className="create-card-header" onClick={() => setIsFormExpanded((v) => !v)}>
            <div className="create-card-title">
              <Icon icon="mdi:map-plus" className="create-icon" />
              <span>New Plan</span>
            </div>
            <Icon
              icon="mdi:chevron-down"
              className={`chevron ${isFormExpanded ? 'chevron--up' : ''}`}
            />
          </div>

          <div className="create-card-body">
            <div className="form-row">
              <div className="form-field">
                <label className="field-label" htmlFor="city-select">City</label>
                <div className="select-wrapper">
                  <select
                    id="city-select"
                    className="field-input"
                    value={newCircuitCityId ?? ''}
                    onChange={(e) =>
                      setNewCircuitCityId(e.target.value ? Number(e.target.value) : null)
                    }
                  >
                    <option value="">Select a city…</option>
                    {citiesOptions.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <Icon icon="mdi:chevron-down" className="select-icon" />
                </div>
              </div>

              <div className="form-field form-field--grow">
                <label className="field-label" htmlFor="plan-name">Plan name</label>
                <input
                  id="plan-name"
                  className="field-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="e.g. Tangier 2 days"
                  autoComplete="off"
                />
              </div>
            </div>

            {createMutation.isError && (
              <div className="alert-error" role="alert">
                <Icon icon="mdi:alert-circle" />
                Failed to create plan. Please try again.
              </div>
            )}

            <div className="form-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setIsFormExpanded(false)
                  setName('')
                  setNewCircuitCityId(null)
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-primary"
                disabled={isCreateDisabled}
                onClick={handleCreate}
              >
                {createMutation.isPending ? (
                  <>
                    <Icon icon="mdi:loading" className="spin" />
                    Creating…
                  </>
                ) : (
                  <>
                    <Icon icon="mdi:check" />
                    Create Plan
                  </>
                )}
              </button>
            </div>
          </div>
        </section>

        {/* ── AI Plan button ── */}
        <button
          type="button"
          className="ai-plan-btn"
          onClick={() => setShowAiWizard(true)}
        >
          <Icon icon="mdi:robot-happy" className="ai-plan-icon" />
          <div className="ai-plan-text">
            <span className="ai-plan-label">Plan with AI</span>
            <span className="ai-plan-desc">Answer 4 quick questions and get a full circuit</span>
          </div>
          <Icon icon="mdi:arrow-right" className="ai-plan-arrow" />
        </button>

        {/* ── Filter + list ── */}
        <section className="list-section">
          <div className="list-toolbar">
            <div className="toolbar-left">
              <span className="section-label">Plans</span>
              {circuitsQuery.isLoading && (
                <span className="loading-chip">
                  <Icon icon="mdi:loading" className="spin" />
                  Loading
                </span>
              )}
              {!circuitsQuery.isLoading && circuits.length > 0 && (
                <span className="count-chip">{circuits.length}</span>
              )}
            </div>

            <div className="filter-wrapper">
              <Icon icon="mdi:city" className="filter-icon" />
              <select
                className="filter-select"
                value={filterCityId ?? ''}
                onChange={(e) => setFilterCityId(e.target.value ? Number(e.target.value) : null)}
                aria-label="Filter by city"
              >
                <option value="">All cities</option>
                {citiesOptions.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <Icon icon="mdi:chevron-down" className="filter-chevron" />
            </div>
          </div>

          {/* Empty state */}
          {circuits.length === 0 && !circuitsQuery.isLoading && (
            <div className="empty-state">
              <div className="empty-icon">
                <Icon icon="mdi:map-search" />
              </div>
              <p className="empty-title">No plans yet</p>
              <p className="empty-desc">
                {filterCityId
                  ? 'No plans for this city. Try clearing the filter or creating a new one.'
                  : 'Get started by creating your first travel plan above.'}
              </p>
              <button
                className="btn-primary"
                onClick={() => setIsFormExpanded(true)}
              >
                <Icon icon="mdi:plus" />
                Create your first plan
              </button>
            </div>
          )}

          {/* Skeleton loader */}
          {circuitsQuery.isLoading && (
            <div className="circuit-list">
              {[1, 2, 3].map((i) => (
                <div key={i} className="circuit-skeleton" />
              ))}
            </div>
          )}

          {/* Circuit cards */}
          {!circuitsQuery.isLoading && circuits.length > 0 && (
            <ul className="circuit-list" role="list">
              {circuits.map((c, idx) => {
                const wq = warningsQueries[idx]
                const rawWarnings = wq?.data ?? []
                const visibleCount = rawWarnings.filter((w) => !keys.has(warningKey(c.id, w))).length

                return (
                  <li key={c.id}>
                    <Link
                      to={`/plan/circuits/${c.id}`}
                      className="circuit-card"
                    >
                      <div className="circuit-avatar">
                        <Icon icon="mdi:map-marker-path" />
                      </div>

                      <div className="circuit-info">
                        <div className="circuit-name-row">
                          <span className="circuit-name">{c.name}</span>
                          <PlanningWarningsBadge count={visibleCount} />
                        </div>
                        <span className="circuit-city">
                          <Icon icon="mdi:city-variant" />
                          {c.cityName ?? '—'}
                        </span>
                      </div>

                      <Icon icon="mdi:chevron-right" className="circuit-arrow" />
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      </div>

      {/* ── AI Wizard modal ── */}
      {showAiWizard && (
        <AiCircuitWizard
          cities={citiesOptions}
          onClose={() => setShowAiWizard(false)}
        />
      )}

      {/* ── Scoped styles ── */}
      <style>{`
        /* ── Reset & tokens ── */
        .circuits-page {
          --brand: #1a6b5a;
          --brand-light: #e8f5f1;
          --brand-mid: #2d9b7a;
          --accent: #f4a124;
          --danger: #dc3545;
          --danger-bg: #fff5f5;
          --text-primary: #111827;
          --text-secondary: #6b7280;
          --text-muted: #9ca3af;
          --border: #e5e7eb;
          --bg: #f9fafb;
          --card-bg: #ffffff;
          --radius: 14px;
          --radius-sm: 8px;
          --shadow: 0 1px 3px rgba(0,0,0,.08), 0 1px 2px rgba(0,0,0,.04);
          --shadow-md: 0 4px 12px rgba(0,0,0,.1);
          --transition: 180ms ease;
          font-family: 'DM Sans', 'Outfit', system-ui, sans-serif;
          background: var(--bg);
          min-height: 100vh;
          color: var(--text-primary);
        }

        /* ── Layout ── */
        .page-inner {
          max-width: 680px;
          margin: 0 auto;
          padding: 16px 16px 80px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        /* ── Header ── */
        .page-header {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding-top: 8px;
        }
        .back-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;
          font-weight: 500;
          color: var(--text-secondary);
          text-decoration: none;
          padding: 6px 10px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border);
          background: var(--card-bg);
          white-space: nowrap;
          transition: color var(--transition), border-color var(--transition);
          flex-shrink: 0;
          margin-top: 2px;
        }
        .back-btn:hover { color: var(--brand); border-color: var(--brand); }
        .back-btn span { display: none; }
        @media (min-width: 480px) { .back-btn span { display: inline; } }

        .header-title-block { flex: 1; }
        .page-title {
          font-size: clamp(20px, 5vw, 26px);
          font-weight: 700;
          letter-spacing: -0.5px;
          color: var(--text-primary);
          margin: 0;
        }
        .page-subtitle {
          margin: 4px 0 0;
          font-size: 13px;
          color: var(--text-secondary);
          line-height: 1.4;
        }

        /* FAB – mobile only */
        .fab {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: var(--brand);
          color: #fff;
          border: none;
          font-size: 20px;
          cursor: pointer;
          box-shadow: var(--shadow-md);
          flex-shrink: 0;
          transition: background var(--transition), transform var(--transition);
        }
        .fab:hover { background: var(--brand-mid); transform: scale(1.06); }
        @media (min-width: 640px) { .fab { display: none; } }

        /* ── Create card ── */
        .create-card {
          background: var(--card-bg);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          box-shadow: var(--shadow);
          overflow: hidden;
        }
        .create-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 16px;
          cursor: pointer;
          user-select: none;
          gap: 8px;
        }
        .create-card-header:hover { background: #fafafa; }
        .create-card-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 600;
          color: var(--text-primary);
        }
        .create-icon { font-size: 18px; color: var(--brand); }
        .chevron {
          font-size: 18px;
          color: var(--text-muted);
          transition: transform 200ms ease;
        }
        .chevron--up { transform: rotate(180deg); }

        .create-card-body {
          max-height: 0;
          overflow: hidden;
          transition: max-height 280ms cubic-bezier(0.4,0,0.2,1), padding 280ms ease;
          padding: 0 16px;
        }
        .create-card--open .create-card-body {
          max-height: 400px;
          padding: 0 16px 16px;
        }
        /* Always show on desktop */
        @media (min-width: 640px) {
          .create-card-header { cursor: default; }
          .create-card-header:hover { background: transparent; }
          .chevron { display: none; }
          .create-card-body {
            max-height: 400px !important;
            padding: 0 16px 16px !important;
          }
        }

        /* ── Form ── */
        .form-row {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        @media (min-width: 480px) { .form-row { flex-direction: row; align-items: flex-end; } }

        .form-field { display: flex; flex-direction: column; gap: 4px; }
        .form-field--grow { flex: 1; }
        .field-label { font-size: 11px; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase; color: var(--text-muted); }

        .field-input,
        .select-wrapper select {
          height: 40px;
          padding: 0 12px;
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          font-size: 14px;
          color: var(--text-primary);
          background: #fff;
          outline: none;
          transition: border-color var(--transition), box-shadow var(--transition);
          width: 100%;
          box-sizing: border-box;
        }
        .field-input:focus,
        .select-wrapper select:focus {
          border-color: var(--brand);
          box-shadow: 0 0 0 3px rgba(26,107,90,.12);
        }

        .select-wrapper {
          position: relative;
          width: 100%;
          min-width: 140px;
        }
        .select-wrapper select { appearance: none; padding-right: 30px; }
        .select-icon {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 16px;
          color: var(--text-muted);
          pointer-events: none;
        }

        .alert-error {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 12px;
          border-radius: var(--radius-sm);
          background: var(--danger-bg);
          color: var(--danger);
          font-size: 13px;
          font-weight: 500;
          margin-top: 10px;
          border: 1px solid #fecaca;
        }

        .form-actions {
          display: flex;
          gap: 8px;
          justify-content: flex-end;
          margin-top: 14px;
          flex-wrap: wrap;
        }

        /* ── Buttons ── */
        .btn-primary, .btn-secondary {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          height: 38px;
          padding: 0 16px;
          border-radius: var(--radius-sm);
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          border: none;
          transition: background var(--transition), opacity var(--transition), transform var(--transition);
          white-space: nowrap;
        }
        .btn-primary {
          background: var(--brand);
          color: #fff;
        }
        .btn-primary:hover:not(:disabled) { background: var(--brand-mid); }
        .btn-primary:active:not(:disabled) { transform: scale(.97); }
        .btn-primary:disabled { opacity: .5; cursor: not-allowed; }

        .btn-secondary {
          background: transparent;
          color: var(--text-secondary);
          border: 1px solid var(--border);
        }
        .btn-secondary:hover { background: var(--bg); color: var(--text-primary); }

        /* ── List section ── */
        .list-section { display: flex; flex-direction: column; gap: 12px; }

        .list-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          flex-wrap: wrap;
        }
        .toolbar-left { display: flex; align-items: center; gap: 8px; }
        .section-label { font-size: 13px; font-weight: 700; color: var(--text-primary); letter-spacing: -0.1px; }

        .loading-chip, .count-chip {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 2px 8px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
        }
        .loading-chip { background: var(--brand-light); color: var(--brand); }
        .count-chip { background: #f3f4f6; color: var(--text-secondary); }

        .filter-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }
        .filter-icon {
          position: absolute;
          left: 9px;
          font-size: 15px;
          color: var(--text-muted);
          pointer-events: none;
          z-index: 1;
        }
        .filter-chevron {
          position: absolute;
          right: 8px;
          font-size: 14px;
          color: var(--text-muted);
          pointer-events: none;
        }
        .filter-select {
          appearance: none;
          height: 34px;
          padding: 0 28px 0 30px;
          border: 1px solid var(--border);
          border-radius: 20px;
          font-size: 13px;
          font-weight: 500;
          color: var(--text-primary);
          background: var(--card-bg);
          cursor: pointer;
          outline: none;
          transition: border-color var(--transition);
          min-width: 120px;
        }
        .filter-select:focus { border-color: var(--brand); }

        /* ── Empty state ── */
        .empty-state {
          background: var(--card-bg);
          border: 1px dashed var(--border);
          border-radius: var(--radius);
          padding: 40px 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 8px;
        }
        .empty-icon {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: var(--brand-light);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 26px;
          color: var(--brand);
          margin-bottom: 4px;
        }
        .empty-title { font-size: 15px; font-weight: 700; color: var(--text-primary); margin: 0; }
        .empty-desc { font-size: 13px; color: var(--text-secondary); max-width: 260px; margin: 0 0 8px; line-height: 1.5; }

        /* ── Skeleton ── */
        @keyframes shimmer {
          from { background-position: -400px 0; }
          to { background-position: 400px 0; }
        }
        .circuit-skeleton {
          height: 72px;
          border-radius: var(--radius);
          background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
          background-size: 800px 100%;
          animation: shimmer 1.4s infinite linear;
        }

        /* ── Circuit list ── */
        .circuit-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .circuit-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px;
          background: var(--card-bg);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          text-decoration: none;
          color: inherit;
          box-shadow: var(--shadow);
          transition: box-shadow var(--transition), border-color var(--transition), transform var(--transition);
          -webkit-tap-highlight-color: transparent;
        }
        .circuit-card:hover {
          box-shadow: var(--shadow-md);
          border-color: #d1d5db;
          transform: translateY(-1px);
        }
        .circuit-card:active { transform: translateY(0); }

        .circuit-avatar {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: var(--brand-light);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          color: var(--brand);
          flex-shrink: 0;
        }
        .circuit-info {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 3px;
        }
        .circuit-name-row {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }
        .circuit-name {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .circuit-city {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: var(--text-secondary);
        }
        .circuit-city svg { font-size: 13px; }
        .circuit-arrow { font-size: 18px; color: var(--text-muted); flex-shrink: 0; }

        /* ── AI Plan button ── */
        .ai-plan-btn {
          display: flex;
          align-items: center;
          gap: 14px;
          width: 100%;
          padding: 16px 18px;
          background: linear-gradient(135deg, #0E2A47 0%, #1C4C78 100%);
          border: none;
          border-radius: var(--radius);
          cursor: pointer;
          text-align: left;
          transition: transform 150ms, box-shadow 150ms;
          box-shadow: 0 2px 8px rgba(14,42,71,.2);
        }
        .ai-plan-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 16px rgba(14,42,71,.3);
        }
        .ai-plan-icon { font-size: 26px; color: #C8A84E; flex-shrink: 0; }
        .ai-plan-text { flex: 1; display: flex; flex-direction: column; gap: 2px; }
        .ai-plan-label { font-size: 14px; font-weight: 700; color: #fff; }
        .ai-plan-desc { font-size: 12px; color: rgba(255,255,255,.65); }
        .ai-plan-arrow { font-size: 18px; color: rgba(255,255,255,.5); flex-shrink: 0; }

        /* ── Spin animation ── */
        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin .8s linear infinite; display: inline-block; }
      `}</style>
    </div>
  )
}