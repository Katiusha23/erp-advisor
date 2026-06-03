// ============================================================
// Pasul 2 — Auditul ERP pe 5 dimensiuni
// Fiecare dimensiune are o întrebare cu 4 opțiuni (scor 1–4)
// ============================================================

import { useState } from 'react';
import { DIMENSIONS } from '../utils/scoring.js';

export default function AuditStep({ scores, onChange, onNext, onPrev }) {
  const [currentDim, setCurrentDim] = useState(0);
  const [error, setError]           = useState(false);

  const dim       = DIMENSIONS[currentDim];
  const isLast    = currentDim === DIMENSIONS.length - 1;
  const isFirst   = currentDim === 0;
  const answered  = Object.values(scores).filter((v) => v > 0).length;

  const selectOption = (score) => {
    onChange({ ...scores, [dim.id]: score });
    setError(false);
  };

  const handleNext = () => {
    if (!scores[dim.id]) {
      setError(true);
      return;
    }
    if (isLast) {
      onNext();
    } else {
      setCurrentDim((d) => d + 1);
      setError(false);
    }
  };

  const handlePrev = () => {
    if (isFirst) {
      onPrev();
    } else {
      setCurrentDim((d) => d - 1);
      setError(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center text-xl">
              {dim.icon}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Audit ERP</h2>
              <p className="text-sm text-slate-500">{dim.description}</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-sm font-semibold text-slate-700">{answered}/{DIMENSIONS.length}</span>
            <p className="text-xs text-slate-400">completate</p>
          </div>
        </div>

        {/* Bara progres dimensiuni */}
        <div className="flex gap-1.5">
          {DIMENSIONS.map((d, i) => (
            <button
              key={d.id}
              onClick={() => setCurrentDim(i)}
              className="flex-1 relative group"
              title={d.label}
            >
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  i < currentDim || scores[d.id]
                    ? 'bg-blue-500'
                    : i === currentDim
                    ? 'bg-blue-300'
                    : 'bg-slate-200'
                }`}
              />
            </button>
          ))}
        </div>

        {/* Etichete dimensiuni */}
        <div className="flex gap-1.5 mt-1">
          {DIMENSIONS.map((d, i) => (
            <div key={d.id} className="flex-1 text-center">
              <span className={`text-[10px] leading-tight block truncate ${
                i === currentDim ? 'text-blue-600 font-medium' : 'text-slate-400'
              }`}>
                {d.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Întrebarea curentă */}
      <div className="mb-6 animate-fade-in" key={dim.id}>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
            Dimensiunea {currentDim + 1} din {DIMENSIONS.length}
          </span>
        </div>
        <h3 className="text-lg font-semibold text-slate-800 mt-2 mb-5 leading-snug">
          {dim.question}
        </h3>

        {/* Opțiunile de răspuns */}
        <div className="space-y-3">
          {dim.options.map((opt) => {
            const isSelected = scores[dim.id] === opt.score;
            const barWidth   = `${(opt.score / 4) * 100}%`;

            return (
              <button
                key={opt.score}
                type="button"
                onClick={() => selectOption(opt.score)}
                className={`
                  w-full text-left p-4 rounded-xl border-2 transition-all duration-200 group
                  ${isSelected
                    ? 'border-blue-500 bg-blue-50 shadow-sm'
                    : 'border-slate-200 hover:border-blue-200 hover:bg-slate-50'}
                `}
              >
                <div className="flex items-start gap-3">
                  {/* Indicator scor */}
                  <div
                    className={`
                      w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5
                      ${isSelected ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-500'}
                    `}
                  >
                    {opt.score}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium leading-snug ${isSelected ? 'text-blue-800' : 'text-slate-700'}`}>
                      {opt.text}
                    </p>

                    {/* Mini progress bar */}
                    <div className="mt-2 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isSelected ? 'bg-blue-500' : 'bg-slate-300 group-hover:bg-slate-400'
                        }`}
                        style={{ width: barWidth }}
                      />
                    </div>
                  </div>

                  {/* Bifă selecție */}
                  {isSelected && (
                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {error && (
          <p className="text-red-500 text-sm mt-3 flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z" />
            </svg>
            Vă rugăm să selectați o opțiune pentru a continua.
          </p>
        )}
      </div>

      {/* Navigare */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <button
          onClick={handlePrev}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-700 font-medium px-4 py-2 rounded-xl hover:bg-slate-100 transition-all"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {isFirst ? 'Profilul Companiei' : 'Înapoi'}
        </button>

        <button
          onClick={handleNext}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2"
        >
          {isLast ? (
            <>
              Vezi Rezultatele
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </>
          ) : (
            <>
              Dimensiunea {currentDim + 2}
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
