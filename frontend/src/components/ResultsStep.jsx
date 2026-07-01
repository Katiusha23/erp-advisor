// ============================================================
// Pasul 3 - Rezultatele auditului
// Afișează: radar chart, scor total, verdict, carduri pe dimensiuni
// Salvează rezultatele anonim și afișează benchmark-ul
// ============================================================

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';
import { DIMENSION_RECOMMENDATIONS } from '../utils/recommendations.js';
import axios from 'axios';
import {
  DIMENSIONS,
  calculateTotalScore,
  calculateDimensionScore,
  getVerdict,
  formatBuget,
} from '../utils/scoring.js';

// Înregistrare componente Chart.js necesare pentru radar chart
ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

// URL-ul backend-ului din variabila de mediu sau implicit local
const API_URL = import.meta.env.VITE_API_URL || '';

export default function ResultsStep({ profile, scores, benchmarkData, setBenchmarkData, onNext, onPrev }) {
  const chartRef   = useRef(null);
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);

  const totalScore = calculateTotalScore(scores);
  const verdict    = getVerdict(totalScore);

  // ============================================================
  // Salvare rezultate anonim și calcul benchmark
  // Se execută o singură dată după afișarea rezultatelor
  // ============================================================
  const saveAndFetchBenchmark = useCallback(async () => {
    if (saved || saving) return;
    setSaving(true);

    const payload = {
      tara:                    profile.tara,
      industrie:               profile.industrie_categorie || profile.industrie,
      industrie_subcategorie:  profile.industrie,
      nr_angajati:             profile.nr_angajati,
      buget:                   profile.buget,
      scor_procese:            scores.procese      || 0,
      scor_financiar:          scores.financiar    || 0,
      scor_it:                 scores.it           || 0,
      scor_echipa:             scores.echipa       || 0,
      scor_conformitate:       scores.conformitate || 0,
      scor_securitate:          scores.securitate          || 0,
      scor_infrastructura_date: scores.infrastructura_date || 0,
      scor_aplicatii_sw:        scores.aplicatii_sw        || 0,
      scor_prezenta_online:     scores.prezenta_online     || 0,
      scor_colaborare:          scores.colaborare          || 0,
      scor_total:              totalScore,
      erp_recomandat:          'In calcul',
    };

    try {
      // Salvare rezultat anonim
      await axios.post(`${API_URL}/api/save-result`, payload);

      // Calcul percentilă față de companiile similare
      const pResp = await axios.get(`${API_URL}/api/benchmark/percentile`, {
        params: {
          country:  profile.tara,
          industry: profile.industrie_categorie || profile.industrie,
          score:    totalScore,
        },
      });

      if (pResp.data?.succes) {
        setBenchmarkData(pResp.data);
      }

      setSaved(true);
    } catch (err) {
      // Erorile de rețea nu blochează afișarea rezultatelor
      console.warn('Backend indisponibil, benchmark dezactivat:', err.message);
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }, [saved, saving, profile, scores, totalScore, setBenchmarkData]);

  useEffect(() => {
    saveAndFetchBenchmark();
  }, [saveAndFetchBenchmark]);

  // ============================================================
  // Date pentru radar chart
  // ============================================================
  const radarData = {
    labels: DIMENSIONS.map((d) => d.label),
    datasets: [
      {
        label: 'Scor Audit',
        data: DIMENSIONS.map((d) => calculateDimensionScore(scores[d.id] || 1)),
        backgroundColor: 'rgba(59, 130, 246, 0.18)',
        borderColor:     'rgba(59, 130, 246, 0.9)',
        borderWidth:     2.5,
        pointBackgroundColor: 'rgba(59, 130, 246, 1)',
        pointBorderColor:     '#fff',
        pointBorderWidth:     2,
        pointRadius:          5,
      },
    ],
  };

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${ctx.raw}%`,
        },
      },
    },
    scales: {
      r: {
        min: 0,
        max: 100,
        ticks: {
          stepSize: 25,
          font: { size: 10 },
          color: '#94a3b8',
          backdropColor: 'transparent',
        },
        grid:        { color: '#e2e8f0' },
        angleLines:  { color: '#e2e8f0' },
        pointLabels: {
          font: { size: 10, weight: 'bold' },
          color: '#475569',
          padding: 12,
          callback: (label) => {
            // Sparge etichetele lungi pe două rânduri
            if (label.length > 12) {
              const mid = label.lastIndexOf(' ', Math.floor(label.length / 2) + 4);
              if (mid > 0) return [label.slice(0, mid), label.slice(mid + 1)];
            }
            return label;
          },
        },
      },
    },
  };

  // ============================================================
  // Culoare progress bar per dimensiune
  // ============================================================
  const barColor = (pct) => {
    if (pct >= 75) return 'bg-green-500';
    if (pct >= 45) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const textColor = (pct) => {
    if (pct >= 75) return 'text-green-700';
    if (pct >= 45) return 'text-yellow-700';
    return 'text-red-700';
  };

  return (
    <div className="space-y-6">
      {/* ====== SCOR TOTAL + VERDICT ====== */}
      <div className={`bg-white rounded-2xl shadow-sm border-2 ${verdict.bgClass} p-6 sm:p-8`}>
        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Cerc scor */}
          <div className="relative w-36 h-36 flex-shrink-0">
            <svg className="w-36 h-36 -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="50" fill="none" stroke="#e2e8f0" strokeWidth="10" />
              <circle
                cx="60" cy="60" r="50" fill="none"
                stroke={verdict.hex} strokeWidth="10"
                strokeDasharray={`${2 * Math.PI * 50}`}
                strokeDashoffset={`${2 * Math.PI * 50 * (1 - totalScore / 100)}`}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 1.2s ease-in-out' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-black" style={{ color: verdict.hex }}>{totalScore}%</span>
              <span className="text-xs font-medium text-slate-500">Scor total</span>
            </div>
          </div>

          {/* Text verdict */}
          <div className="text-center sm:text-left">
            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full font-bold text-sm mb-2 ${verdict.badgeClass}`}>
              {{
                high: '✅', medium: '⚠️', low: '❌',
              }[verdict.level]} {verdict.label}
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-1">Rezultatul Evaluării ERP</h2>
            <p className="text-slate-600 text-sm leading-relaxed max-w-md">
              {verdict.level === 'high'   && 'Felicitări! Compania dumneavoastră are o pregătire excelentă și este pregătită pentru implementarea unui sistem ERP.'}
              {verdict.level === 'medium' && 'Compania are o bază solidă, dar sunt necesare câteva îmbunătățiri înainte de implementarea ERP.'}
              {verdict.level === 'low'    && 'Compania necesită pregătire suplimentară înainte de a demara implementarea unui sistem ERP.'}
            </p>

            {/* Profil rezumat */}
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="bg-slate-100 text-slate-600 text-xs px-2.5 py-1 rounded-full">
                {profile.tara === 'RO' ? '🇷🇴 România' : '🇲🇩 Moldova'}
              </span>
              {profile.industrie_categorie && (
                <span className="bg-slate-100 text-slate-600 text-xs px-2.5 py-1 rounded-full">
                  {profile.industrie_categorie}
                </span>
              )}
              {profile.industrie && (
                <span className="bg-blue-50 text-blue-600 text-xs px-2.5 py-1 rounded-full">
                  {profile.industrie}
                </span>
              )}
              <span className="bg-slate-100 text-slate-600 text-xs px-2.5 py-1 rounded-full">
                {profile.nr_angajati} angajați
              </span>
              <span className="bg-slate-100 text-slate-600 text-xs px-2.5 py-1 rounded-full">
                {formatBuget(profile.buget)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ====== RADAR CHART + CARDURI DIMENSIUNI ====== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-base font-bold text-slate-700 mb-4">Radar Scoruri</h3>
          <div className="flex justify-center">
            <div className="w-full max-w-xs">
              <Radar ref={chartRef} data={radarData} options={radarOptions} />
            </div>
          </div>
        </div>

        {/* Carduri dimensiuni */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-base font-bold text-slate-700 mb-4">Scor per Dimensiune</h3>
          <div className="space-y-4">
            {DIMENSIONS.map((dim) => {
              const pct = calculateDimensionScore(scores[dim.id] || 0);
              const level = pct <= 33 ? 'low' : pct <= 66 ? 'medium' : 'high';
              const rec = DIMENSION_RECOMMENDATIONS[dim.id]?.[level];
              return (
                <div key={dim.id} className={`rounded-xl p-3 transition-all ${level === 'low' ? 'bg-red-50/60' : level === 'medium' ? 'bg-yellow-50/60' : 'bg-slate-50/40'}`}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{dim.icon}</span>
                      <span className="text-sm font-medium text-slate-700">{dim.label}</span>
                    </div>
                    <span className={`text-sm font-bold ${textColor(pct)}`}>{pct}%</span>
                  </div>
                  <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden mb-1">
                    <div
                      className={`h-full rounded-full progress-bar ${barColor(pct)}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-400">{dim.description}</p>

                  {/* Recomandare specifică pentru scoruri slabe/medii */}
                  {rec && (
                    <div className={`mt-2.5 rounded-lg p-2.5 border ${level === 'low' ? 'bg-red-50 border-red-100' : 'bg-yellow-50 border-yellow-100'}`}>
                      <p className={`text-xs font-semibold mb-1.5 ${level === 'low' ? 'text-red-700' : 'text-yellow-700'}`}>
                        {level === 'low' ? '⚠️' : '💡'} {rec.title}
                      </p>
                      <ul className="space-y-1">
                        {rec.actions.map((action, i) => (
                          <li key={i} className={`text-xs flex items-start gap-1.5 ${level === 'low' ? 'text-red-600' : 'text-yellow-700'}`}>
                            <span className="mt-0.5 flex-shrink-0">→</span>
                            <span>{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ====== BENCHMARK ====== */}
      {benchmarkData && benchmarkData.total_companii > 0 && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white shadow-sm">
          <div className="flex items-center gap-4">
            <div className="text-4xl font-black text-white opacity-90">
              {benchmarkData.percentila}%
            </div>
            <div>
              <p className="font-semibold text-lg leading-snug">
                Compania ta e mai pregătită decât{' '}
                <span className="text-blue-200 font-black">{benchmarkData.percentila}%</span>{' '}
                din IMM-urile din <span className="text-blue-200">{profile.industrie_categorie || profile.industrie}</span>
              </p>
            </div>
            <div className="ml-auto text-5xl hidden sm:block">📊</div>
          </div>
        </div>
      )}

      {/* ====== LEGENDĂ CULORI ====== */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Interpretarea scorului</p>
        <div className="flex flex-wrap gap-3">
          {[
            { color: 'bg-red-500',    range: '0 – 44%',   label: 'Necesită Pregătire',  desc: 'Procese manuale, infrastructură insuficientă' },
            { color: 'bg-yellow-400', range: '45 – 74%',  label: 'Pregătire Parțială',  desc: 'Parțial digitalizat, ajustări necesare' },
            { color: 'bg-green-500',  range: '75 – 100%', label: 'Pregătit pentru ERP', desc: 'Procese mature, pregătit pentru ERP' },
          ].map((item) => (
            <div key={item.range} className="flex items-start gap-2 flex-1 min-w-[180px] p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className={`w-3 h-3 rounded-full mt-0.5 flex-shrink-0 ${item.color}`} />
              <div>
                <p className="text-xs font-semibold text-slate-700">{item.range} - {item.label}</p>
                <p className="text-xs text-slate-500">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ====== NAVIGARE ====== */}
      <div className="flex items-center justify-between bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
        <button
          onClick={onPrev}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-700 font-medium px-4 py-2 rounded-xl hover:bg-slate-100 transition-all"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Înapoi la Evaluare
        </button>

        <button
          onClick={onNext}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2"
        >
          Recomandare ERP
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
