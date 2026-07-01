import { useState } from 'react';
import { DIMENSIONS, PROCESS_QUESTIONS, calculateERPCompatibility } from '../utils/scoring.js';
import { TECH_QUESTIONS, calcTechCompatibility } from '../utils/techQuestions.js';
import Tooltip from './Tooltip.jsx';
import { TECH_TERMS } from '../utils/recommendations.js';

function LiveScoreBar({ profile, scores, techAnswers }) {
  const dimResults   = calculateERPCompatibility(profile, scores);
  const answered     = Object.values(scores).filter((v) => v > 0).length;
  const techAnswered = Object.keys(techAnswers || {}).length;
  if (answered === 0) return null;

  const finalResults = dimResults.map((r) => {
    if (techAnswered === 0) return r;
    const tech    = calcTechCompatibility(techAnswers, r.name);
    const blended = Math.round(r.compatibility * 0.75 + tech.score * 0.25);
    return { ...r, compatibility: Math.min(100, Math.max(0, blended)) };
  });

  const colors = {
    'WinMentor':      { bar: 'bg-blue-500',    text: 'text-blue-700',    bg: 'bg-blue-50',    border: 'border-blue-200' },
    'UNA.md':         { bar: 'bg-emerald-500',  text: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
    'Saga Software':  { bar: 'bg-violet-500',   text: 'text-violet-700',  bg: 'bg-violet-50',  border: 'border-violet-200' },
    'Odoo Community': { bar: 'bg-orange-500',   text: 'text-orange-700',  bg: 'bg-orange-50',  border: 'border-orange-200' },
  };

  return (
    <div className="mb-4 p-3 bg-slate-50 border border-slate-200 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
          Compatibilitate ERP — timp real
        </p>
        {techAnswered > 0 && (
          <span className="text-[10px] bg-amber-50 text-amber-600 font-medium px-2 py-0.5 rounded border border-amber-200">
            include audit tehnic
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {finalResults.map((r) => {
          const c = colors[r.name] || { bar: 'bg-slate-400', text: 'text-slate-700', bg: 'bg-slate-50', border: 'border-slate-200' };
          return (
            <div key={r.name} className={`${c.bg} border ${c.border} rounded-lg px-2.5 py-2`}>
              <div className={`text-xs font-bold ${c.text} truncate`}>{r.name}</div>
              <div className="flex items-center gap-1.5 mt-1">
                <div className="flex-1 h-1.5 bg-white rounded-full overflow-hidden">
                  <div className={`h-full ${c.bar} rounded-full transition-all duration-500`} style={{ width: `${r.compatibility}%` }} />
                </div>
                <span className={`text-xs font-bold ${c.text} w-8 text-right`}>{r.compatibility}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const TCO_STEP_ID = '__tco__';

export default function AuditStep({ scores, onChange, onNext, onPrev, profile, plan, techAnswers, onTechChange, tcoData, onTcoChange }) {
  const [currentDim, setCurrentDim] = useState(0);
  const [error, setError]           = useState(false);
  const [tcoError, setTcoError]     = useState('');

  const isPremium    = plan === 'premium';
  const allQuestions = isPremium
    ? [...DIMENSIONS, ...TECH_QUESTIONS, { id: TCO_STEP_ID, label: 'Estimare costuri manuale', icon: '' }]
    : DIMENSIONS;
  const totalSteps   = allQuestions.length;

  const isTcoStep     = isPremium && currentDim === totalSteps - 1;
  const isTechSection = isPremium && currentDim >= DIMENSIONS.length && !isTcoStep;
  const currentQ      = allQuestions[currentDim];

  const industryQ = !isTechSection && currentQ.id === 'procese' && profile?.industrie_categorie
    ? (PROCESS_QUESTIONS[profile.industrie_categorie] || PROCESS_QUESTIONS.default)
    : null;
  const dim = industryQ
    ? { ...currentQ, question: industryQ.question, options: industryQ.options }
    : currentQ;

  const isLast  = currentDim === totalSteps - 1;
  const isFirst = currentDim === 0;

  const currentAnswer = isTechSection ? techAnswers?.[dim.id] : scores[dim.id];

  const answeredRegular = Object.values(scores).filter((v) => v > 0).length;
  const answeredTech    = isPremium ? Object.keys(techAnswers || {}).length : 0;
  const totalAnswered   = answeredRegular + answeredTech;

  const selectOption = (value) => {
    if (isTechSection) {
      onTechChange({ ...(techAnswers || {}), [dim.id]: value });
    } else {
      onChange({ ...scores, [dim.id]: value });
    }
    setError(false);
  };

  const handleNext = () => {
    if (isTcoStep) {
      setTcoError('');
      onNext();
      return;
    }
    if (!currentAnswer) { setError(true); return; }
    if (isLast) { onNext(); }
    else { setCurrentDim((d) => d + 1); setError(false); }
  };

  const handlePrev = () => {
    if (isFirst) { onPrev(); }
    else { setCurrentDim((d) => d - 1); setError(false); }
  };

  const nextLabel = isTcoStep
    ? 'Vezi Rezultatele'
    : isLast
    ? 'Estimare costuri'
    : isPremium && currentDim === DIMENSIONS.length - 1
    ? 'Audit Tehnic'
    : isTechSection
    ? `Întrebarea ${currentDim - DIMENSIONS.length + 2}`
    : `Dimensiunea ${currentDim + 2}`;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 sm:p-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              {isTechSection ? 'Audit tehnic avansat' : 'Evaluare ERP'}
            </h2>
            <p className="text-sm text-slate-400">{dim.description || dim.label}</p>
          </div>
          <div className="text-right">
            <span className="text-sm font-semibold text-slate-700">{totalAnswered}/{totalSteps}</span>
            <p className="text-xs text-slate-400">completate</p>
          </div>
        </div>

        <LiveScoreBar profile={profile} scores={scores} techAnswers={techAnswers} />

        {/* Bara de progres */}
        <div className="flex gap-1 mb-2">
          {allQuestions.map((q, i) => {
            const isCurrent   = i === currentDim;
            const isTech      = isPremium && i >= DIMENSIONS.length;
            const isCompleted = isTech ? !!(techAnswers?.[q.id]) : !!(scores[q.id] && scores[q.id] > 0);
            return (
              <button
                key={q.id}
                onClick={() => setCurrentDim(i)}
                className="flex-1 group"
                title={q.label}
              >
                <div className={`w-full h-1.5 rounded-full transition-colors ${
                  isCompleted ? (isTech ? 'bg-amber-400' : 'bg-blue-500')
                  : isCurrent ? (isTech ? 'bg-amber-300' : 'bg-blue-300')
                  : 'bg-slate-200 group-hover:bg-slate-300'
                }`} />
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-500">{dim.label}</p>
          {isPremium && (
            <span className={`text-xs px-2 py-0.5 rounded font-medium border ${
              isTechSection
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-slate-50 text-slate-500 border-slate-200'
            }`}>
              {isTechSection ? 'Premium' : 'Basic'}
            </span>
          )}
        </div>
      </div>

      {/* Separator secțiune tech */}
      {isTechSection && currentDim === DIMENSIONS.length && (
        <div className="mb-5 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700 font-medium">
          Evaluarea de bază este completă. Urmează auditul tehnic avansat ({TECH_QUESTIONS.length} întrebări).
        </div>
      )}

      {/* Pasul costuri manuale */}
      {isTcoStep && (
        <div className="mb-6 space-y-5">
          <div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">Estimare costuri procese manuale</h3>
            <p className="text-sm text-slate-500">Completați datele pentru a calcula economiile estimate și break-even-ul investiției (opțional).</p>
          </div>
          <div className="space-y-4">
            {[
              { key: 'ore_manuale',        label: 'Ore/săptămână pierdute pe procese manuale', placeholder: 'ex: 20', suffix: 'ore/săpt.' },
              { key: 'nr_angajati_erp',    label: 'Număr angajați implicați în aceste procese', placeholder: 'ex: 10', suffix: 'angajați' },
              { key: 'cost_orar',          label: 'Cost orar mediu per angajat',                placeholder: 'ex: 15', suffix: '€/oră' },
              { key: 'buget_implementare', label: 'Bugetul estimat pentru implementare ERP',    placeholder: 'ex: 5000', suffix: '€' },
            ].map((f) => (
              <div key={f.key}>
                <label className="block text-sm font-semibold text-slate-700 mb-1">{f.label}</label>
                <div className="flex items-center border-2 border-slate-200 rounded-lg overflow-hidden focus-within:border-amber-400 transition-colors">
                  <input
                    type="number"
                    min="0"
                    value={tcoData[f.key] || ''}
                    onChange={(e) => { onTcoChange({ ...tcoData, [f.key]: e.target.value }); setTcoError(''); }}
                    placeholder={f.placeholder}
                    className="flex-1 px-4 py-3 text-sm outline-none bg-white"
                  />
                  <span className="px-3 py-3 bg-slate-50 text-slate-500 text-xs border-l border-slate-200 whitespace-nowrap">{f.suffix}</span>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-400 italic">Toate câmpurile sunt opționale. Puteți continua fără a le completa.</p>
        </div>
      )}

      {/* Întrebarea curentă */}
      {!isTcoStep && <div className="mb-6 animate-fade-in" key={dim.id}>
        <div className="flex items-center flex-wrap gap-2 mb-1">
          <span className={`text-xs font-medium px-2 py-0.5 rounded ${
            isTechSection ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'
          }`}>
            {isTechSection
              ? `Tehnic ${currentDim - DIMENSIONS.length + 1} din ${TECH_QUESTIONS.length}`
              : `Dimensiunea ${currentDim + 1} din ${DIMENSIONS.length}`}
          </span>
          {!isTechSection && dim.toeContext && (
            <span className="text-xs text-slate-400 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded flex items-center gap-1">
              {dim.toeContext.includes('TOE') && <Tooltip term="TOE" explanation={TECH_TERMS['TOE']} />}
              {dim.toeContext.includes('TAM') && <Tooltip term="TAM" explanation={TECH_TERMS['TAM']} />}
              {dim.toeContext}
            </span>
          )}
        </div>
        <h3 className="text-lg font-semibold text-slate-800 mt-2 mb-5 leading-snug">
          {dim.question}
        </h3>

        <div className="space-y-2.5">
          {dim.options.map((opt, idx) => {
            const optValue   = isTechSection ? opt.text : opt.score;
            const isSelected = currentAnswer === optValue;
            const barWidth   = `${((opt.score || (idx + 1)) / 4) * 100}%`;

            return (
              <button
                key={idx}
                type="button"
                onClick={() => selectOption(optValue)}
                className={`
                  w-full text-left p-4 rounded-lg border-2 transition-colors group
                  ${isSelected
                    ? isTechSection
                      ? 'border-amber-400 bg-amber-50'
                      : 'border-blue-500 bg-blue-50'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'}
                `}
              >
                <div className="flex items-start gap-3">
                  <div className={`
                    w-6 h-6 rounded flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5
                    ${isSelected
                      ? isTechSection ? 'bg-amber-400 text-white' : 'bg-blue-500 text-white'
                      : 'bg-slate-100 text-slate-400'}
                  `}>
                    {isTechSection ? (idx + 1) : opt.score}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium leading-snug ${isSelected ? (isTechSection ? 'text-amber-800' : 'text-blue-800') : 'text-slate-700'}`}>
                      {opt.text}
                    </p>
                    <div className="mt-2 h-1 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isSelected
                            ? isTechSection ? 'bg-amber-400' : 'bg-blue-500'
                            : 'bg-slate-200 group-hover:bg-slate-300'
                        }`}
                        style={{ width: barWidth }}
                      />
                    </div>
                  </div>
                  {isSelected && (
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isTechSection ? 'bg-amber-400' : 'bg-blue-500'
                    }`}>
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
            Selectați o opțiune pentru a continua.
          </p>
        )}
      </div>}

      {/* Navigare */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <button
          onClick={handlePrev}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-700 font-medium px-4 py-2 rounded-lg hover:bg-slate-100 transition-colors text-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {isFirst ? 'Profilul Companiei' : 'Înapoi'}
        </button>

        <button
          onClick={handleNext}
          className={`text-white font-medium px-8 py-3 rounded-lg transition-colors flex items-center gap-2 text-sm ${
            isTechSection ? 'bg-amber-500 hover:bg-amber-600' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {nextLabel}
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
