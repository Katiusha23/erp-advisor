// ============================================================
// Pasul 4 — Recomandarea ERP și metodologia de implementare
// Afișează: clasament ERP, metodologie, plan de acțiune, buton PDF
// ============================================================

import { useRef, useState } from 'react';
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
import axios from 'axios';
import {
  DIMENSIONS,
  calculateTotalScore,
  calculateDimensionScore,
  getVerdict,
  calculateERPCompatibility,
  getMethodology,
  formatBuget,
} from '../utils/scoring.js';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

// Dacă VITE_API_URL e setat, folosim acel URL (pentru producție pe Render)
// Dacă nu, folosim string gol — requestul merge prin proxy-ul Vite la localhost:3001
const API_URL = import.meta.env.VITE_API_URL || '';

export default function RecommendationStep({ profile, scores, benchmarkData, onReset, onPrev }) {
  const chartRef         = useRef(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError,   setPdfError]   = useState(null);

  const totalScore    = calculateTotalScore(scores);
  const verdict       = getVerdict(totalScore);
  const erpList       = calculateERPCompatibility(profile, scores);
  const topERP        = erpList[0];
  const metodologie   = getMethodology(totalScore);

  // ============================================================
  // Descărcare raport PDF — trimite datele la backend
  // Capturează radar chart-ul ca imagine base64
  // ============================================================
  const downloadPDF = async () => {
    setPdfLoading(true);
    setPdfError(null);

    // Captare radar chart ca imagine base64 PNG
    let radarChartImage = null;
    try {
      const chartInstance = chartRef.current;
      if (chartInstance) {
        radarChartImage = chartInstance.toBase64Image('image/png', 1.0);
      }
    } catch {
      // Nu blocăm generarea PDF dacă imaginea nu poate fi capturată
    }

    const payload = {
      profil: {
        tara:        profile.tara,
        industrie:   profile.industrie,
        nr_angajati: profile.nr_angajati,
        buget:       profile.buget,
      },
      scoruri: {
        procese:      scores.procese      || 0,
        financiar:    scores.financiar    || 0,
        it:           scores.it           || 0,
        echipa:       scores.echipa       || 0,
        conformitate: scores.conformitate || 0,
      },
      scorTotal:  totalScore,
      verdict:    { label: verdict.label, level: verdict.level },
      erpRecomandat: {
        name:          topERP.name,
        compatibility: topERP.compatibility,
        description:   topERP.description,
        pros:          topERP.pros,
        cons:          topERP.cons,
      },
      metodologie: {
        name:        metodologie.name,
        duration:    metodologie.duration,
        description: metodologie.description,
        phases:      metodologie.phases,
      },
      radarChartImage,
      benchmarkInfo: benchmarkData || null,
    };

    try {
      const response = await axios.post(`${API_URL}/api/generate-pdf`, payload, {
        responseType: 'blob',
      });

      // Declanșare descărcare în browser
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url  = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href  = url;
      link.setAttribute('download', 'raport-erp-advisor.pdf');
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      // Așteptăm 2 secunde înainte de a revoca URL-ul (browserul are nevoie de timp)
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 2000);
    } catch (err) {
      console.error('Eroare generare PDF:', err);
      // Afișăm eroarea reală din browser console pentru debugging
      const msg = err?.response?.status
        ? `Eroare server ${err.response.status}`
        : err?.message || 'Eroare necunoscută';
      setPdfError(`Nu s-a putut genera PDF-ul (${msg}). Verificați că backend-ul rulează pe portul 3001.`);
    } finally {
      setPdfLoading(false);
    }
  };

  // ============================================================
  // Date radar chart (identic cu ResultsStep, pentru PDF export)
  // ============================================================
  const radarData = {
    labels: DIMENSIONS.map((d) => d.label),
    datasets: [{
      label: 'Scor Audit',
      data: DIMENSIONS.map((d) => calculateDimensionScore(scores[d.id] || 1)),
      backgroundColor: 'rgba(59, 130, 246, 0.18)',
      borderColor: 'rgba(59, 130, 246, 0.9)',
      borderWidth: 2.5,
      pointBackgroundColor: 'rgba(59, 130, 246, 1)',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 5,
    }],
  };

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: { legend: { display: false } },
    scales: {
      r: {
        min: 0, max: 100,
        ticks: { stepSize: 25, font: { size: 10 }, color: '#94a3b8', backdropColor: 'transparent' },
        grid:        { color: '#e2e8f0' },
        angleLines:  { color: '#e2e8f0' },
        pointLabels: { font: { size: 10 }, color: '#475569' },
      },
    },
  };

  // Culori compatibilitate ERP
  const compatColor = (pct) => {
    if (pct >= 75) return { bar: 'bg-green-500',  text: 'text-green-700',  badge: 'bg-green-100 text-green-800' };
    if (pct >= 50) return { bar: 'bg-blue-500',   text: 'text-blue-700',   badge: 'bg-blue-100 text-blue-800' };
    return             { bar: 'bg-slate-400',  text: 'text-slate-600',  badge: 'bg-slate-100 text-slate-600' };
  };

  return (
    <div className="space-y-6">

      {/* ====== ERP RECOMANDAT — CARD PRINCIPAL ====== */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 sm:p-8 text-white shadow-lg">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-blue-200 text-sm font-medium mb-1">ERP Recomandat pentru compania dumneavoastră</p>
            <div className="flex items-center gap-3">
              <span className="text-4xl">{topERP.logo}</span>
              <h2 className="text-3xl font-black">{topERP.name}</h2>
            </div>
            <p className="text-sm text-blue-200 mt-1">{topERP.vendor}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-5xl font-black text-white">{topERP.compatibility}%</div>
            <div className="text-blue-200 text-xs">compatibilitate</div>
          </div>
        </div>

        <p className="text-blue-100 text-sm leading-relaxed mb-5">{topERP.description}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white/10 rounded-xl p-4">
            <p className="text-xs font-semibold text-blue-200 mb-2">✅ Avantaje</p>
            <ul className="space-y-1">
              {topERP.pros.map((p, i) => (
                <li key={i} className="text-xs text-white flex items-start gap-1.5">
                  <span className="text-green-300 mt-0.5">•</span> {p}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white/10 rounded-xl p-4">
            <p className="text-xs font-semibold text-blue-200 mb-2">⚠ Limitări</p>
            <ul className="space-y-1">
              {topERP.cons.map((c, i) => (
                <li key={i} className="text-xs text-white flex items-start gap-1.5">
                  <span className="text-red-300 mt-0.5">•</span> {c}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* ====== CLASAMENT TOATE SISTEMELE ERP ====== */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-5">Comparație Sisteme ERP</h3>
        <div className="space-y-4">
          {erpList.map((erp, idx) => {
            const cc = compatColor(erp.compatibility);
            return (
              <div key={erp.id} className={`p-4 rounded-xl border ${idx === 0 ? 'border-blue-200 bg-blue-50' : 'border-slate-100 bg-slate-50'}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${idx === 0 ? 'bg-blue-600 text-white' : 'bg-slate-300 text-slate-700'}`}>
                      {idx + 1}
                    </div>
                    <span className="text-lg">{erp.logo}</span>
                    <div>
                      <span className="font-semibold text-slate-800 text-sm">{erp.name}</span>
                      {idx === 0 && (
                        <span className="ml-2 text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">Recomandat</span>
                      )}
                      <p className="text-xs text-slate-500">{erp.vendor}</p>
                    </div>
                  </div>
                  <span className={`font-bold text-sm ${cc.text}`}>{erp.compatibility}%</span>
                </div>
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full progress-bar ${cc.bar}`}
                    style={{ width: `${erp.compatibility}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ====== METODOLOGIE ====== */}
      <div className={`bg-white rounded-2xl shadow-sm border-2 ${metodologie.bgClass} p-6`}>
        <div className="flex items-start gap-4 mb-5">
          <div className="text-4xl">{metodologie.icon}</div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">{metodologie.name}</h3>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ backgroundColor: metodologie.color + '20', color: metodologie.color }}>
                Durată: {metodologie.duration}
              </span>
            </div>
          </div>
        </div>

        <p className="text-slate-600 text-sm leading-relaxed mb-6">{metodologie.description}</p>

        {/* Plan de acțiune pe 3 etape */}
        <h4 className="font-semibold text-slate-700 mb-4 text-sm">Plan de acțiune în 3 etape:</h4>
        <div className="space-y-3">
          {metodologie.phases.map((ph, i) => (
            <div key={i} className="flex gap-4 p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                style={{ backgroundColor: metodologie.color }}
              >
                {i + 1}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-slate-800 text-sm">{ph.title}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: metodologie.color + '20', color: metodologie.color }}>
                    {ph.duration}
                  </span>
                </div>
                <p className="text-slate-500 text-xs mt-1 leading-relaxed">{ph.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ====== RADAR CHART ASCUNS — PENTRU EXPORT PDF ====== */}
      <div style={{ position: 'absolute', left: '-9999px', top: '-9999px', width: '400px', height: '400px' }}>
        <Radar ref={chartRef} data={radarData} options={radarOptions} />
      </div>

      {/* ====== BUTON DESCĂRCARE PDF ====== */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-slate-800">Descarcă Raportul Complet</h3>
            <p className="text-sm text-slate-500 mt-0.5">
              PDF profesional cu toate rezultatele, recomandarea ERP și planul de implementare
            </p>
            {pdfError && (
              <p className="text-red-500 text-xs mt-1">⚠ {pdfError}</p>
            )}
          </div>

          <button
            onClick={downloadPDF}
            disabled={pdfLoading}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md whitespace-nowrap w-full sm:w-auto justify-center"
          >
            {pdfLoading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Se generează...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Descarcă Raportul PDF
              </>
            )}
          </button>
        </div>
      </div>

      {/* ====== BENCHMARK (dacă există date) ====== */}
      {benchmarkData && benchmarkData.total_companii > 0 && (
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-5 text-white">
          <div className="flex items-center gap-4">
            <span className="text-4xl">📊</span>
            <div>
              <p className="font-bold text-lg">
                Top <span className="text-yellow-300">{100 - benchmarkData.percentila}%</span> din IMM-uri
              </p>
              <p className="text-indigo-200 text-sm">
                Compania ta e mai pregătită decât{' '}
                <strong className="text-white">{benchmarkData.percentila}%</strong> din IMM-urile din {profile.industrie} —{' '}
                {profile.tara === 'RO' ? 'România' : 'Moldova'}
                {' '}({benchmarkData.total_companii} companii analizate)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ====== NAVIGARE ====== */}
      <div className="flex items-center justify-between bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
        <button
          onClick={onPrev}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-700 font-medium px-4 py-2 rounded-xl hover:bg-slate-100 transition-all"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Înapoi la Rezultate
        </button>

        <button
          onClick={onReset}
          className="flex items-center gap-2 text-white bg-slate-700 hover:bg-slate-800 font-semibold px-6 py-2.5 rounded-xl transition-all duration-200"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Audit Nou
        </button>
      </div>
    </div>
  );
}
