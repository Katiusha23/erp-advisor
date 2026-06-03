// ============================================================
// Pasul 1 — Profilul Companiei
// Colectează: țara, nr. angajați, industria, bugetul estimat
// ============================================================

import { useState } from 'react';

const INDUSTRIES = [
  'Producție', 'Comerț', 'Servicii', 'Retail', 'Construcții', 'Altele',
];

const BUDGETS = [
  { value: 'sub5k',    label: 'Sub 5.000 €',           desc: 'Start-up sau buget foarte limitat' },
  { value: '5-15k',    label: '5.000 € – 15.000 €',    desc: 'Soluții accesibile pentru IMM' },
  { value: '15-40k',   label: '15.000 € – 40.000 €',   desc: 'Implementare mid-market' },
  { value: 'peste40k', label: 'Peste 40.000 €',         desc: 'Soluție enterprise completă' },
];

export default function ProfileStep({ profile, onChange, onNext }) {
  const [errors, setErrors] = useState({});

  const update = (field, value) => {
    onChange({ ...profile, [field]: value });
    if (errors[field]) setErrors({ ...errors, [field]: null });
  };

  const validate = () => {
    const e = {};
    if (!profile.industrie) e.industrie = 'Selectați industria companiei';
    if (!profile.buget)     e.buget     = 'Selectați bugetul estimat';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (validate()) onNext();
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
      {/* Titlu secțiune */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-xl">🏢</div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Profilul Companiei</h2>
            <p className="text-sm text-slate-500">Completați datele generale ale companiei dumneavoastră</p>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {/* ---- ȚARA ---- */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-3">
            Țara de operare
          </label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: 'RO', flag: '🇷🇴', label: 'România' },
              { value: 'MD', flag: '🇲🇩', label: 'Moldova' },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => update('tara', opt.value)}
                className={`
                  flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200
                  ${profile.tara === opt.value
                    ? 'border-blue-500 bg-blue-50 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'}
                `}
              >
                <span className="text-2xl">{opt.flag}</span>
                <span className={`font-semibold text-sm ${profile.tara === opt.value ? 'text-blue-700' : 'text-slate-700'}`}>
                  {opt.label}
                </span>
                {profile.tara === opt.value && (
                  <div className="ml-auto w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ---- NUMĂR ANGAJAȚI ---- */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-3">
            Număr angajați
            <span className="ml-2 bg-blue-100 text-blue-700 font-bold px-3 py-0.5 rounded-full text-sm">
              {profile.nr_angajati}
            </span>
          </label>
          <input
            type="range"
            min={1}
            max={250}
            value={profile.nr_angajati}
            onChange={(e) => update('nr_angajati', parseInt(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>1</span>
            <span>50</span>
            <span>100</span>
            <span>150</span>
            <span>200</span>
            <span>250</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            {profile.nr_angajati <= 10 && 'Micro-întreprindere (1–10 angajați)'}
            {profile.nr_angajati > 10  && profile.nr_angajati <= 50  && 'Întreprindere mică (11–50 angajați)'}
            {profile.nr_angajati > 50  && profile.nr_angajati <= 250 && 'Întreprindere mijlocie (51–250 angajați)'}
          </p>
        </div>

        {/* ---- INDUSTRIA ---- */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-3">
            Domeniu de activitate
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {INDUSTRIES.map((ind) => (
              <button
                key={ind}
                type="button"
                onClick={() => update('industrie', ind)}
                className={`
                  px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all duration-200 text-left
                  ${profile.industrie === ind
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'}
                `}
              >
                {{
                  'Producție': '🏭', 'Comerț': '🛒', 'Servicii': '💼',
                  'Retail': '🏪', 'Construcții': '🏗️', 'Altele': '📦',
                }[ind]} {ind}
              </button>
            ))}
          </div>
          {errors.industrie && (
            <p className="text-red-500 text-xs mt-2">⚠ {errors.industrie}</p>
          )}
        </div>

        {/* ---- BUGET ESTIMAT ---- */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-3">
            Buget estimat pentru implementarea ERP
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {BUDGETS.map((b) => (
              <button
                key={b.value}
                type="button"
                onClick={() => update('buget', b.value)}
                className={`
                  p-4 rounded-xl border-2 text-left transition-all duration-200
                  ${profile.buget === b.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'}
                `}
              >
                <div className={`font-semibold text-sm ${profile.buget === b.value ? 'text-blue-700' : 'text-slate-700'}`}>
                  {b.label}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">{b.desc}</div>
              </button>
            ))}
          </div>
          {errors.buget && (
            <p className="text-red-500 text-xs mt-2">⚠ {errors.buget}</p>
          )}
        </div>
      </div>

      {/* Buton Continuare */}
      <div className="mt-8 flex justify-end">
        <button
          onClick={handleNext}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2"
        >
          Continuă
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
