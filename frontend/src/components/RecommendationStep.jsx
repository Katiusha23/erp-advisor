import { useRef, useState } from 'react';
import PremiumModal from './PremiumModal.jsx';
import { calcTechCompatibility } from '../utils/techQuestions.js';
import { calcTCO } from '../utils/tco.js';
import TermTooltip from './Tooltip.jsx';
import { TECH_TERMS } from '../utils/recommendations.js';
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

const API_URL = import.meta.env.VITE_API_URL || '';

export default function RecommendationStep({ profile, scores, techAnswers, tcoData, benchmarkData, plan, onReset, onPrev }) {
  const chartRef         = useRef(null);
  const [pdfLoading,   setPdfLoading]   = useState(false);
  const [pdfError,     setPdfError]     = useState(null);
  const [showPremium,  setShowPremium]  = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailStatus,  setEmailStatus]  = useState(null);

  const totalScore    = calculateTotalScore(scores);
  const verdict       = getVerdict(totalScore);
  const erpList       = calculateERPCompatibility(profile, scores);
  const topERP        = erpList[0];
  const metodologie   = getMethodology(totalScore);

  const techResult = (plan === 'premium' && topERP && techAnswers && Object.keys(techAnswers).length > 0)
    ? calcTechCompatibility(techAnswers, topERP.name)
    : null;
  const tcoResult = (plan === 'premium' && tcoData && tcoData.ore_manuale && tcoData.nr_angajati_erp && tcoData.cost_orar)
    ? calcTCO(tcoData, profile.buget)
    : null;

  const downloadPDF = async () => {
    setPdfLoading(true);
    setPdfError(null);

    let radarChartImage = null;
    try {
      const chartInstance = chartRef.current;
      if (chartInstance) {
        radarChartImage = chartInstance.toBase64Image('image/png', 1.0);
      }
    } catch { }

    const payload = {
      profil: {
        tara:                   profile.tara,
        industrie:              profile.industrie_categorie || profile.industrie,
        industrie_subcategorie: profile.industrie,
        nr_angajati:            profile.nr_angajati,
        buget:                  profile.buget,
      },
      scoruri: {
        procese:             scores.procese             || 0,
        financiar:           scores.financiar           || 0,
        it:                  scores.it                  || 0,
        echipa:              scores.echipa              || 0,
        conformitate:        scores.conformitate        || 0,
        securitate:          scores.securitate          || 0,
        infrastructura_date: scores.infrastructura_date || 0,
        aplicatii_sw:        scores.aplicatii_sw        || 0,
        prezenta_online:     scores.prezenta_online     || 0,
        colaborare:          scores.colaborare          || 0,
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
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url  = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href  = url;
      link.setAttribute('download', 'raport-erp-advisor.pdf');
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 2000);
    } catch (err) {
      const msg = err?.response?.status
        ? `Eroare server ${err.response.status}`
        : err?.message || 'Eroare necunoscută';
      setPdfError(`Nu s-a putut genera PDF-ul (${msg}). Verificați că backend-ul rulează pe portul 3001.`);
    } finally {
      setPdfLoading(false);
    }
  };

  const radarData = {
    labels: DIMENSIONS.map((d) => d.label),
    datasets: [{
      label: 'Scor Audit',
      data: DIMENSIONS.map((d) => calculateDimensionScore(scores[d.id] || 1)),
      backgroundColor: 'rgba(59, 130, 246, 0.15)',
      borderColor: 'rgba(59, 130, 246, 0.8)',
      borderWidth: 2,
      pointBackgroundColor: 'rgba(59, 130, 246, 1)',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 4,
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
        pointLabels: {
          font: { size: 10 },
          color: '#475569',
          padding: 12,
          callback: (label) => {
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

  const compatColor = (pct) => {
    if (pct >= 75) return { bar: 'bg-green-500',  text: 'text-green-700' };
    if (pct >= 50) return { bar: 'bg-blue-500',   text: 'text-blue-700' };
    return             { bar: 'bg-slate-400',  text: 'text-slate-500' };
  };

  return (
    <div className="space-y-5">

      {/* ====== ERP RECOMANDAT ====== */}
      <div className="rounded-lg shadow-sm border border-slate-200" style={{ background: '#c8ede9' }}>
        <div className="p-6 sm:p-8">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-3">
            {profile.are_erp === 'da_migr'
              ? `Recomandat pentru migrarea de la ${profile.erp_existent || 'sistemul actual'}`
              : profile.are_erp === 'da_comp'
              ? `Alternativă recomandată față de ${profile.erp_existent || 'sistemul actual'}`
              : 'ERP recomandat pentru compania dumneavoastră'}
          </p>

          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">{topERP.name}</h2>
              <p className="text-sm text-slate-400 mt-0.5">{topERP.vendor}</p>
            </div>
            <div className="text-right flex-shrink-0 ml-4">
              <div className="text-4xl font-bold text-blue-600">{topERP.compatibility}%</div>
              <div className="text-xs text-slate-400">compatibilitate</div>
            </div>
          </div>

          <p className="text-sm text-slate-600 leading-relaxed mt-4 mb-6">
            {topERP.description}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-lg p-4 border border-white/60" style={{ background: 'rgba(255,255,255,0.45)' }}>
              <p className="text-xs font-semibold text-slate-600 mb-2">Avantaje</p>
              <ul className="space-y-1.5">
                {topERP.pros.map((p, i) => (
                  <li key={i} className="text-xs text-slate-600 flex items-start gap-2">
                    <span className="text-green-500 mt-0.5 flex-shrink-0">-</span> {p}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-lg p-4 border border-white/60" style={{ background: 'rgba(255,255,255,0.45)' }}>
              <p className="text-xs font-semibold text-slate-600 mb-2">Limitări</p>
              <ul className="space-y-1.5">
                {topERP.cons.map((c, i) => (
                  <li key={i} className="text-xs text-slate-600 flex items-start gap-2">
                    <span className="text-slate-400 mt-0.5 flex-shrink-0">-</span> {c}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* ====== COMPARAȚIE ERP ====== */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <h3 className="text-base font-semibold text-slate-700 mb-4">Comparație sisteme ERP</h3>
        <div className="space-y-3">
          {erpList.map((erp, idx) => {
            const cc = compatColor(erp.compatibility);
            return (
              <div key={erp.id} className={`p-4 rounded-lg border ${idx === 0 ? 'border-slate-200' : 'border-slate-100'}`} style={idx === 0 ? { background: '#c8ede9' } : {}}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded flex items-center justify-center text-xs font-semibold bg-slate-100 text-slate-500">{idx + 1}</span>
                    <div>
                      <span className="font-medium text-slate-800 text-sm">{erp.name}</span>
                      {idx === 0 && (
                        <span className="ml-2 text-xs bg-blue-600 text-white px-2 py-0.5 rounded text-[10px]">recomandat</span>
                      )}
                      <p className="text-xs text-slate-400">{erp.vendor}</p>
                    </div>
                  </div>
                  <span className={`font-semibold text-sm ${cc.text}`}>{erp.compatibility}%</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
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
      <div className="rounded-lg shadow-sm border border-slate-200 p-6" style={{ background: '#e2d0f0' }}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold text-slate-800">{metodologie.name}</h3>
            <span className="text-xs text-slate-400 mt-0.5 block">Durată estimată: {metodologie.duration}</span>
          </div>
          <span className="text-xs font-medium px-2.5 py-1 rounded border text-slate-600 border-slate-200 bg-slate-50">
            {metodologie.duration}
          </span>
        </div>

        <p className="text-sm text-slate-600 leading-relaxed mb-5">{metodologie.description}</p>

        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Plan de acțiune</p>
        <div className="space-y-2">
          {metodologie.phases.map((ph, i) => (
            <div key={i} className="flex gap-4 p-4 rounded-lg border border-white/60" style={{ background: 'rgba(255,255,255,0.45)' }}>
              <div
                className="w-7 h-7 rounded flex items-center justify-center text-white font-semibold text-sm flex-shrink-0 mt-0.5"
                style={{ backgroundColor: metodologie.color }}
              >
                {i + 1}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-slate-800 text-sm">{ph.title}</span>
                  <span className="text-xs text-slate-400">{ph.duration}</span>
                </div>
                <p className="text-slate-500 text-xs mt-1 leading-relaxed">{ph.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ====== MODAL PREMIUM ====== */}
      {showPremium && (
        <PremiumModal
          onClose={() => setShowPremium(false)}
          profile={profile}
          scores={scores}
          erpRecomandat={topERP}
        />
      )}

      {/* Radar chart ascuns pentru PDF */}
      <div style={{ position: 'absolute', left: '-9999px', top: '-9999px', width: '400px', height: '400px' }}>
        <Radar ref={chartRef} data={radarData} options={radarOptions} />
      </div>

      {/* ====== SALVARE REZULTATE ====== */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 space-y-4">
        <h3 className="font-semibold text-slate-700">Salvați rezultatele</h3>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={downloadPDF}
            disabled={pdfLoading}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium px-6 py-3 rounded-lg transition-colors text-sm"
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
                Descarcă raport PDF
              </>
            )}
          </button>

          <button
            onClick={async () => {
              if (!profile.email) { setEmailStatus('no-email'); return; }
              setEmailLoading(true);
              setEmailStatus(null);
              try {
                await axios.post(`${API_URL}/api/send-results`, {
                  email:        profile.email,
                  profil:       profile,
                  scorTotal:    totalScore,
                  verdict:      { label: verdict.label, level: verdict.level },
                  erpRecomandat: { name: topERP.name, compatibility: topERP.compatibility, description: topERP.description },
                  plan,
                  techAnswers,
                });
                setEmailStatus('success');
              } catch {
                setEmailStatus('error');
              } finally {
                setEmailLoading(false);
              }
            }}
            disabled={emailLoading}
            className="flex-1 flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-800 disabled:bg-slate-400 text-white font-medium px-6 py-3 rounded-lg transition-colors text-sm"
          >
            {emailLoading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Se trimite...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Trimite pe email
                {plan === 'premium' && <span className="text-xs opacity-70 ml-1">+ consultanță</span>}
              </>
            )}
          </button>
        </div>

        {emailStatus === 'success' && (
          <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Email trimis la <strong className="mx-1">{profile.email}</strong>
            {plan === 'premium' && '— veți fi contactat în 48h.'}
          </div>
        )}
        {emailStatus === 'error' && (
          <p className="text-red-500 text-xs">Nu s-a putut trimite emailul. Verificați că backend-ul rulează.</p>
        )}
        {emailStatus === 'no-email' && (
          <p className="text-amber-600 text-xs">Nu ați introdus o adresă de email în profilul companiei.</p>
        )}
        {pdfError && <p className="text-red-500 text-xs">{pdfError}</p>}
      </div>

      {/* ====== BENCHMARK ====== */}
      {benchmarkData && benchmarkData.total_companii > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-5">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-slate-800">
                Percentila <span className="text-indigo-600">{benchmarkData.percentila}</span> din 100
              </p>
              <p className="text-slate-500 text-sm mt-0.5">
                Compania dvs. e mai pregătită decât{' '}
                <strong className="text-slate-700">{benchmarkData.percentila}%</strong> din IMM-urile din{' '}
                {profile.industrie_categorie || profile.industrie} —{' '}
                {profile.tara === 'RO' ? 'România' : 'Moldova'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ====== REZULTATE PREMIUM ====== */}
      {techResult && (
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-amber-50 border border-amber-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 text-sm">Compatibilitate tehnică — {topERP.name}</h3>
                <p className="text-xs text-slate-400">Bazat pe infrastructura IT declarată</p>
              </div>
            </div>
            <div className="flex items-center gap-4 mb-3">
              <div className={`text-3xl font-bold ${techResult.score >= 75 ? 'text-green-600' : techResult.score >= 50 ? 'text-amber-500' : 'text-red-500'}`}>
                {techResult.score}%
              </div>
              <div className="flex-1">
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${techResult.score >= 75 ? 'bg-green-500' : techResult.score >= 50 ? 'bg-amber-400' : 'bg-red-400'}`}
                    style={{ width: `${techResult.score}%` }} />
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {techResult.score >= 75 ? 'Infrastructura este compatibilă cu ' + topERP.name
                    : techResult.score >= 50 ? 'Compatibilitate parțială — ajustări minore necesare'
                    : 'Sunt necesare modificări de infrastructură înainte de implementare'}
                </p>
              </div>
            </div>
            {techResult.notes.length > 0 && (
              <div className="space-y-1.5 mt-3 border-t border-slate-100 pt-3">
                {techResult.notes.map((n, i) => (
                  <div key={i} className="flex gap-2 p-3 bg-slate-50 rounded-lg text-xs text-slate-600 border border-slate-100">
                    <svg className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20A10 10 0 0012 2z" />
                    </svg>
                    <span>{n}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {tcoResult && (
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-5 mt-4">
              <h3 className="font-semibold text-slate-800 text-sm mb-3">Estimare costuri & economii</h3>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { label: 'Costuri manuale actuale/an', value: `${Math.round(tcoResult.costuriActuale).toLocaleString('ro-RO')} €`, color: 'text-red-600', bg: 'bg-red-50' },
                  ...(tcoResult.roi3ani !== null ? [{ label: 'ROI estimat pe 3 ani', value: `${tcoResult.roi3ani}%`, color: 'text-green-600', bg: 'bg-green-50' }] : []),
                ].map((item) => (
                  <div key={item.label} className={`p-3 rounded-lg ${item.bg} border border-slate-100`}>
                    <p className="text-xs text-slate-500 mb-0.5">{item.label}</p>
                    <p className={`text-lg font-bold ${item.color}`}>{item.value}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-400 mt-2 italic">
                Economiile sunt estimate la ~65% reducere a timpului manual după implementare ERP.
                {!tcoData.buget_implementare && tcoResult.bugetFolosit > 0 && ` ROI calculat pe baza bugetului selectat în profil (${tcoResult.bugetFolosit.toLocaleString('ro-RO')} €).`}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ====== PLANURI (doar Basic) ====== */}
      {plan !== 'premium' && (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h3 className="text-base font-semibold text-slate-700 mb-1">Alegeți planul potrivit</h3>
          <p className="text-sm text-slate-400 mb-5">Raportul de bază este gratuit. Deblocați analiza avansată cu planul Premium.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-lg border-2 border-slate-200 p-5 flex flex-col">
              <div className="mb-4">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Basic</span>
                <div className="mt-1">
                  <span className="text-2xl font-bold text-slate-800">Gratuit</span>
                </div>
              </div>
              <ul className="space-y-2 flex-1 mb-5">
                {[
                  { ok: true,  text: 'Audit pe 10 dimensiuni' },
                  { ok: true,  text: 'Scor pregătire ERP' },
                  { ok: true,  text: 'Recomandare sistem ERP' },
                  { ok: true,  text: 'Comparație 4 sisteme' },
                  { ok: true,  text: 'Raport PDF de bază' },
                  { ok: false, text: 'Audit tehnic avansat' },
                ].map((f) => (
                  <li key={f.text} className="flex items-start gap-2 text-sm">
                    <span className={`mt-0.5 flex-shrink-0 ${f.ok ? 'text-green-500' : 'text-slate-200'}`}>
                      {f.ok ? '✓' : '✗'}
                    </span>
                    <span className={f.ok ? 'text-slate-700' : 'text-slate-300'}>{f.text}</span>
                  </li>
                ))}
              </ul>
              <div className="text-center text-xs text-slate-400 py-2 border border-slate-200 rounded-lg">
                Plan activ
              </div>
            </div>

            <div className="rounded-lg border-2 border-amber-300 p-5 flex flex-col bg-amber-50 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-amber-500 text-white text-xs font-medium px-3 py-1 rounded">Recomandat</span>
              </div>
              <div className="mb-4">
                <span className="text-xs font-semibold text-amber-600 uppercase tracking-wide">Premium</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-bold text-slate-800">29 €</span>
                  <span className="text-slate-400 text-sm">plată unică</span>
                </div>
              </div>
              <ul className="space-y-2 flex-1 mb-5">
                {[
                  'Tot ce include Basic',
                  'Audit tehnic OS & Rețea',
                  'Audit Firewall & Securitate',
                  'Raport PDF complet',
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-slate-700">
                    <span className="text-amber-500 mt-0.5 flex-shrink-0">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => setShowPremium(true)}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-medium py-2.5 rounded-lg transition-colors text-sm"
              >
                Accesați analiza Premium
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====== NAVIGARE ====== */}
      <div className="flex items-center justify-between bg-white rounded-lg shadow-sm border border-slate-200 p-4">
        <button
          onClick={onPrev}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-700 font-medium px-4 py-2 rounded-lg hover:bg-slate-100 transition-colors text-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Înapoi la Rezultate
        </button>

        <button
          onClick={onReset}
          className="flex items-center gap-2 text-white bg-slate-700 hover:bg-slate-800 font-medium px-6 py-2.5 rounded-lg transition-colors text-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Evaluare nouă
        </button>
      </div>
    </div>
  );
}
