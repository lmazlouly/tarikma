import { useState } from 'react'
import { Icon } from '@iconify/react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { aiGenerateCircuit } from '../../shared/api/circuits'

const INTEREST_OPTIONS = [
  { value: 'Culture', icon: 'mdi:mosque', label: 'Culture' },
  { value: 'Nature', icon: 'mdi:tree', label: 'Nature' },
  { value: 'Food', icon: 'mdi:food', label: 'Food' },
  { value: 'Shopping', icon: 'mdi:shopping', label: 'Shopping' },
  { value: 'Beaches', icon: 'mdi:beach', label: 'Beaches' },
  { value: 'Nightlife', icon: 'mdi:glass-cocktail', label: 'Nightlife' },
]

const DAY_OPTIONS = [1, 2, 3, 4, 5, 6, 7]

type CityOption = { id: number; name: string }

type Props = {
  cities: CityOption[]
  onClose: () => void
}

export function AiCircuitWizard({ cities, onClose }: Props) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [step, setStep] = useState(0)
  const [cityId, setCityId] = useState<number | null>(null)
  const [numberOfDays, setNumberOfDays] = useState(2)
  const [interests, setInterests] = useState<string[]>([])
  const [travelDate, setTravelDate] = useState('')

  const toggleInterest = (v: string) => {
    setInterests((prev) =>
      prev.includes(v) ? prev.filter((i) => i !== v) : [...prev, v]
    )
  }

  const generateMutation = useMutation({
    mutationFn: () =>
      aiGenerateCircuit({
        cityId: cityId!,
        numberOfDays,
        interests: interests.length > 0 ? interests : undefined,
        travelDate: travelDate || undefined,
      }),
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ['my-circuits'] })
      onClose()
      navigate(`/plan/circuits/${data.id}`)
    },
  })

  const canNext =
    step === 0 ? cityId != null :
    step === 1 ? true :
    step === 2 ? true :
    step === 3 ? true :
    false

  const isLastStep = step === 3
  const totalSteps = 4

  const handleNext = () => {
    if (isLastStep) {
      generateMutation.mutate()
    } else {
      setStep((s) => s + 1)
    }
  }

  const handleBack = () => {
    if (step > 0) setStep((s) => s - 1)
  }

  const cityName = cities.find((c) => c.id === cityId)?.name ?? ''

  // Get tomorrow as min date for the date picker
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const minDate = tomorrow.toISOString().split('T')[0]

  // Max date: 5 days from now (OpenWeatherMap free tier limit)
  const maxDateObj = new Date()
  maxDateObj.setDate(maxDateObj.getDate() + 5)
  const maxDate = maxDateObj.toISOString().split('T')[0]

  return (
    <div className="ai-wizard-overlay" onClick={onClose}>
      <div className="ai-wizard" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="ai-wizard-header">
          <div className="ai-wizard-header-left">
            <Icon icon="mdi:robot-happy" className="ai-wizard-logo" />
            <div>
              <h2 className="ai-wizard-title">AI Trip Planner</h2>
              <p className="ai-wizard-subtitle">
                Step {step + 1} of {totalSteps}
              </p>
            </div>
          </div>
          <button className="ai-wizard-close" onClick={onClose} aria-label="Close">
            <Icon icon="mdi:close" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="ai-wizard-progress">
          <div
            className="ai-wizard-progress-bar"
            style={{ width: `${((step + 1) / totalSteps) * 100}%` }}
          />
        </div>

        {/* Step content */}
        <div className="ai-wizard-body">
          {step === 0 && (
            <div className="ai-step">
              <h3 className="ai-step-question">Which city are you visiting?</h3>
              <div className="ai-city-grid">
                {cities.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    className={`ai-city-chip ${cityId === c.id ? 'ai-city-chip--active' : ''}`}
                    onClick={() => setCityId(c.id)}
                  >
                    <Icon icon="mdi:city-variant-outline" />
                    {c.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="ai-step">
              <h3 className="ai-step-question">How many days in {cityName}?</h3>
              <div className="ai-days-grid">
                {DAY_OPTIONS.map((d) => (
                  <button
                    key={d}
                    type="button"
                    className={`ai-day-chip ${numberOfDays === d ? 'ai-day-chip--active' : ''}`}
                    onClick={() => setNumberOfDays(d)}
                  >
                    {d} {d === 1 ? 'day' : 'days'}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="ai-step">
              <h3 className="ai-step-question">What are you interested in?</h3>
              <p className="ai-step-hint">Select one or more (optional)</p>
              <div className="ai-interest-grid">
                {INTEREST_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    className={`ai-interest-chip ${interests.includes(opt.value) ? 'ai-interest-chip--active' : ''}`}
                    onClick={() => toggleInterest(opt.value)}
                  >
                    <Icon icon={opt.icon} className="ai-interest-icon" />
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="ai-step">
              <h3 className="ai-step-question">When are you traveling?</h3>
              <p className="ai-step-hint">
                We'll check the weather to suggest the best plan (optional, up to 5 days ahead)
              </p>
              <input
                type="date"
                className="ai-date-input"
                value={travelDate}
                onChange={(e) => setTravelDate(e.target.value)}
                min={minDate}
                max={maxDate}
              />
              {travelDate && (
                <button
                  type="button"
                  className="ai-date-clear"
                  onClick={() => setTravelDate('')}
                >
                  <Icon icon="mdi:close-circle" /> Clear date
                </button>
              )}
            </div>
          )}
        </div>

        {/* Error */}
        {generateMutation.isError && (
          <div className="ai-wizard-error">
            <Icon icon="mdi:alert-circle" />
            {(generateMutation.error as Error)?.message || 'Generation failed. Please try again.'}
          </div>
        )}

        {/* Footer */}
        <div className="ai-wizard-footer">
          {step > 0 ? (
            <button
              type="button"
              className="ai-wizard-btn ai-wizard-btn--ghost"
              onClick={handleBack}
              disabled={generateMutation.isPending}
            >
              <Icon icon="mdi:arrow-left" /> Back
            </button>
          ) : (
            <button
              type="button"
              className="ai-wizard-btn ai-wizard-btn--ghost"
              onClick={onClose}
            >
              Cancel
            </button>
          )}

          <button
            type="button"
            className={`ai-wizard-btn ${isLastStep ? 'ai-wizard-btn--generate' : 'ai-wizard-btn--primary'}`}
            disabled={!canNext || generateMutation.isPending}
            onClick={handleNext}
          >
            {generateMutation.isPending ? (
              <>
                <Icon icon="mdi:loading" className="animate-spin" />
                Generating…
              </>
            ) : isLastStep ? (
              <>
                <Icon icon="mdi:auto-fix" />
                Generate Circuit
              </>
            ) : (
              <>
                Next <Icon icon="mdi:arrow-right" />
              </>
            )}
          </button>
        </div>
      </div>

      <style>{`
        .ai-wizard-overlay {
          position: fixed;
          inset: 0;
          z-index: 50;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0,0,0,.45);
          backdrop-filter: blur(4px);
          padding: 16px;
        }
        .ai-wizard {
          background: #fff;
          border-radius: 20px;
          width: 100%;
          max-width: 480px;
          box-shadow: 0 20px 60px rgba(0,0,0,.2);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          max-height: 90vh;
        }

        /* Header */
        .ai-wizard-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 24px 12px;
        }
        .ai-wizard-header-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .ai-wizard-logo {
          font-size: 28px;
          color: #0E2A47;
        }
        .ai-wizard-title {
          font-size: 18px;
          font-weight: 700;
          color: #111827;
          margin: 0;
        }
        .ai-wizard-subtitle {
          font-size: 12px;
          color: #9ca3af;
          margin: 2px 0 0;
        }
        .ai-wizard-close {
          background: none;
          border: none;
          font-size: 20px;
          color: #9ca3af;
          cursor: pointer;
          padding: 4px;
          border-radius: 8px;
          transition: background 150ms;
        }
        .ai-wizard-close:hover { background: #f3f4f6; color: #374151; }

        /* Progress */
        .ai-wizard-progress {
          height: 3px;
          background: #e5e7eb;
          margin: 0 24px;
          border-radius: 2px;
          overflow: hidden;
        }
        .ai-wizard-progress-bar {
          height: 100%;
          background: linear-gradient(90deg, #0E2A47, #1C4C78);
          border-radius: 2px;
          transition: width 300ms ease;
        }

        /* Body */
        .ai-wizard-body {
          padding: 24px;
          min-height: 200px;
          overflow-y: auto;
        }
        .ai-step-question {
          font-size: 16px;
          font-weight: 600;
          color: #111827;
          margin: 0 0 16px;
        }
        .ai-step-hint {
          font-size: 13px;
          color: #6b7280;
          margin: -8px 0 16px;
        }

        /* City chips */
        .ai-city-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .ai-city-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 10px 16px;
          border: 1.5px solid #e5e7eb;
          border-radius: 12px;
          background: #fff;
          font-size: 14px;
          font-weight: 500;
          color: #374151;
          cursor: pointer;
          transition: all 150ms;
        }
        .ai-city-chip:hover { border-color: #0E2A47; color: #0E2A47; }
        .ai-city-chip--active {
          border-color: #0E2A47;
          background: #0E2A47;
          color: #fff;
        }

        /* Day chips */
        .ai-days-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .ai-day-chip {
          padding: 10px 20px;
          border: 1.5px solid #e5e7eb;
          border-radius: 12px;
          background: #fff;
          font-size: 14px;
          font-weight: 500;
          color: #374151;
          cursor: pointer;
          transition: all 150ms;
        }
        .ai-day-chip:hover { border-color: #0E2A47; color: #0E2A47; }
        .ai-day-chip--active {
          border-color: #0E2A47;
          background: #0E2A47;
          color: #fff;
        }

        /* Interest chips */
        .ai-interest-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
        }
        @media (min-width: 400px) {
          .ai-interest-grid { grid-template-columns: repeat(3, 1fr); }
        }
        .ai-interest-chip {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          padding: 14px 8px;
          border: 1.5px solid #e5e7eb;
          border-radius: 14px;
          background: #fff;
          font-size: 13px;
          font-weight: 500;
          color: #374151;
          cursor: pointer;
          transition: all 150ms;
        }
        .ai-interest-chip:hover { border-color: #C8A84E; }
        .ai-interest-chip--active {
          border-color: #C8A84E;
          background: #FDF8EC;
          color: #92700A;
        }
        .ai-interest-icon { font-size: 22px; }

        /* Date input */
        .ai-date-input {
          width: 100%;
          padding: 12px 14px;
          border: 1.5px solid #e5e7eb;
          border-radius: 12px;
          font-size: 14px;
          color: #111827;
          outline: none;
          transition: border-color 150ms;
          box-sizing: border-box;
        }
        .ai-date-input:focus { border-color: #0E2A47; }
        .ai-date-clear {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          margin-top: 8px;
          background: none;
          border: none;
          font-size: 13px;
          color: #6b7280;
          cursor: pointer;
        }
        .ai-date-clear:hover { color: #dc3545; }

        /* Error */
        .ai-wizard-error {
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 0 24px;
          padding: 10px 14px;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 10px;
          font-size: 13px;
          color: #991b1b;
        }

        /* Footer */
        .ai-wizard-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 24px 20px;
          gap: 12px;
        }
        .ai-wizard-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 10px 20px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          border: none;
          transition: all 150ms;
        }
        .ai-wizard-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .ai-wizard-btn--ghost {
          background: none;
          color: #6b7280;
        }
        .ai-wizard-btn--ghost:hover:not(:disabled) { color: #111827; background: #f3f4f6; }
        .ai-wizard-btn--primary {
          background: #0E2A47;
          color: #fff;
        }
        .ai-wizard-btn--primary:hover:not(:disabled) { background: #143A5F; }
        .ai-wizard-btn--generate {
          background: linear-gradient(135deg, #0E2A47, #1C4C78);
          color: #fff;
          box-shadow: 0 2px 8px rgba(14,42,71,.3);
        }
        .ai-wizard-btn--generate:hover:not(:disabled) {
          box-shadow: 0 4px 16px rgba(14,42,71,.4);
          transform: translateY(-1px);
        }
      `}</style>
    </div>
  )
}
