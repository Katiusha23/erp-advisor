// ============================================================
// Stepper vizual — afișează progresul prin cei 4 pași ai auditului
// ============================================================

export default function Stepper({ steps, currentStep }) {
  return (
    <div className="mb-8">
      {/* Bara de progres mobilă (vizibilă pe ecrane mici) */}
      <div className="sm:hidden mb-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-blue-600">
            Pasul {currentStep + 1} din {steps.length}
          </span>
          <span className="text-xs text-slate-500">{steps[currentStep]}</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Stepper complet (vizibil pe desktop) */}
      <div className="hidden sm:flex items-center">
        {steps.map((label, idx) => {
          const isDone    = idx < currentStep;
          const isCurrent = idx === currentStep;

          return (
            <div key={idx} className="flex items-center flex-1 last:flex-none">
              {/* Cerc pas */}
              <div className="flex flex-col items-center">
                <div
                  className={`
                    w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold
                    transition-all duration-300 shadow-sm
                    ${isDone    ? 'bg-blue-600 text-white'                          : ''}
                    ${isCurrent ? 'bg-blue-600 text-white ring-4 ring-blue-100'     : ''}
                    ${!isDone && !isCurrent ? 'bg-white text-slate-400 border-2 border-slate-200' : ''}
                  `}
                >
                  {isDone ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    idx + 1
                  )}
                </div>

                {/* Etichetă */}
                <span
                  className={`mt-1.5 text-xs font-medium text-center leading-tight max-w-[80px] ${
                    isCurrent ? 'text-blue-600' : isDone ? 'text-slate-600' : 'text-slate-400'
                  }`}
                >
                  {label}
                </span>
              </div>

              {/* Linie conectoare (nu după ultimul pas) */}
              {idx < steps.length - 1 && (
                <div className="flex-1 mx-2 mb-5">
                  <div className="h-0.5 w-full bg-slate-200 relative overflow-hidden">
                    <div
                      className="absolute inset-y-0 left-0 bg-blue-500 transition-all duration-500"
                      style={{ width: isDone ? '100%' : '0%' }}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
