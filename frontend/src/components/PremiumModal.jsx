import { useState } from 'react';
import { calcTechCompatibility } from '../utils/techQuestions.js';

// Întrebări audit tehnic avansat
const TECH_QUESTIONS = [
  {
    id: 'os_tip',
    label: 'Sistem de operare predominant',
    icon: '💻',
    options: [
      { value: 'windows10', label: 'Windows 10',           desc: 'Suport până în oct. 2025' },
      { value: 'windows11', label: 'Windows 11',           desc: 'Recomandat, suport activ' },
      { value: 'windowsS',  label: 'Windows Server',       desc: '2016 / 2019 / 2022' },
      { value: 'macos',     label: 'macOS',                desc: 'Apple Silicon sau Intel Mac' },
      { value: 'linux',     label: 'Linux',                desc: 'Ubuntu, CentOS, Debian etc.' },
      { value: 'mix',       label: 'Mixt (Win + Mac/Linux)', desc: 'Infrastructură eterogenă' },
    ],
  },
  {
    id: 'retea_tip',
    label: 'Tipul rețelei interne',
    icon: '🌐',
    options: [
      { value: 'workgroup',  label: 'Workgroup',         desc: 'Fără server central, peer-to-peer' },
      { value: 'domeniu',    label: 'Domeniu Windows',   desc: 'Active Directory / LDAP' },
      { value: 'cloud',      label: 'Cloud-first',       desc: 'Azure AD / Google Workspace' },
      { value: 'hibrid',     label: 'Hibrid On-prem + Cloud', desc: 'Infrastructură mixtă' },
    ],
  },
  {
    id: 'admin_retea',
    label: 'Administrarea rețelei',
    icon: '🛠️',
    options: [
      { value: 'intern',      label: 'Departament IT intern',   desc: 'Echipă IT dedicată' },
      { value: 'extern',      label: 'Firma externalizată',     desc: 'IT managed service' },
      { value: 'partial',     label: 'Parțial intern + extern', desc: 'Responsabilități împărțite' },
      { value: 'nimeni',      label: 'Fără admin dedicat',      desc: 'Autogestionat de utilizatori' },
    ],
  },
  {
    id: 'securitate',
    label: 'Politici de securitate',
    icon: '🔒',
    options: [
      { value: 'basic',      label: 'Antivirus + firewall',      desc: 'Protecție minimă' },
      { value: 'policies',   label: 'Group Policy (GPO)',        desc: 'Politici de grup configurate' },
      { value: 'advanced',   label: 'SIEM + MFA + GPO',         desc: 'Securitate avansată' },
      { value: 'iso27001',   label: 'Certificare ISO 27001',     desc: 'Standard internațional' },
    ],
  },
  {
    id: 'firewall',
    label: 'Infrastructură firewall / rețea',
    icon: '🧱',
    options: [
      { value: 'router',     label: 'Router ISP + Windows FW',  desc: 'Protecție de bază' },
      { value: 'hw_fw',      label: 'Firewall hardware dedicat', desc: 'Cisco, Fortinet, Sophos etc.' },
      { value: 'utm',        label: 'UTM / Next-Gen Firewall',  desc: 'IPS, DPI, VPN integrat' },
      { value: 'cloud_fw',   label: 'Cloud firewall / SD-WAN',  desc: 'Palo Alto, Zscaler etc.' },
    ],
  },
];


// ============================================================
// Componenta principală
// ============================================================
export default function PremiumModal({ onClose, profile, scores, erpRecomandat }) {
  const [stage, setStage] = useState('paywall'); // paywall | tehnic | rezultate
  const [techStep, setTechStep] = useState(0);
  const [techAnswers, setTechAnswers] = useState({});

  const erpName = erpRecomandat?.name || 'Saga';
  const currentQ = TECH_QUESTIONS[techStep];

  const selectTechAnswer = (qId, val) => {
    const updated = { ...techAnswers, [qId]: val };
    setTechAnswers(updated);
    setTimeout(() => {
      if (techStep < TECH_QUESTIONS.length - 1) {
        setTechStep((s) => s + 1);
      } else {
        setStage('rezultate');
      }
    }, 300);
  };

  const techResult = (stage === 'rezultate' && Object.keys(techAnswers).length > 0)
    ? calcTechCompatibility(techAnswers, erpName)
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-t-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">⭐</span>
              <div>
                <h2 className="text-xl font-black">Analiză Premium</h2>
                <p className="text-amber-100 text-sm">Audit tehnic avansat al infrastructurii IT</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {/* Progress */}
          {stage === 'tehnic' && (
            <div className="mt-4">
              <div className="h-1.5 bg-white/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all"
                  style={{ width: `${((techStep + 1) / TECH_QUESTIONS.length) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="p-6">

          {/* ====== PAYWALL ====== */}
          {stage === 'paywall' && (
            <div className="space-y-6">
              <div className="text-center">
                <p className="text-slate-600 text-sm leading-relaxed">
                  Doriți o analiză completă și specifică infrastructurii companiei dumneavoastră?
                  Raportul premium include audit tehnic detaliat al compatibilității ERP cu infrastructura IT existentă.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { icon: '🖥️', title: 'Compatibilitate OS & Rețea',  desc: 'Analiza compatibilității ERP cu Windows, Linux, domeniu, workgroup' },
                  { icon: '🧱', title: 'Audit Firewall & Securitate',  desc: 'Evaluarea politicilor de securitate și infrastructurii de rețea' },
                  { icon: '📊', title: 'Scor compatibilitate tehnică',  desc: 'Procent de compatibilitate între infrastructura ta și ERP-ul recomandat' },
                  { icon: '💡', title: 'Recomandări specifice',         desc: 'Observații tehnice personalizate pentru sistemul tău IT' },
                ].map((f) => (
                  <div key={f.title} className="flex gap-3 p-4 bg-amber-50 rounded-xl border border-amber-100">
                    <span className="text-2xl flex-shrink-0">{f.icon}</span>
                    <div>
                      <p className="font-semibold text-slate-800 text-sm">{f.title}</p>
                      <p className="text-slate-500 text-xs mt-0.5">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-slate-50 rounded-2xl p-6 text-center border border-slate-200">
                <p className="text-slate-500 text-xs mb-1">Acces complet la toate funcționalitățile premium</p>
                <div className="flex items-baseline justify-center gap-1 mb-1">
                  <span className="text-4xl font-black text-slate-800">29</span>
                  <span className="text-xl font-bold text-slate-600">€</span>
                </div>
                <p className="text-slate-400 text-xs mb-4">plată unică • raport PDF inclus</p>
                <button
                  onClick={() => setStage('tehnic')}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold py-3 rounded-xl transition-all shadow-sm hover:shadow-md text-sm"
                >
                  Continuați cu Analiza Premium →
                </button>
              </div>
            </div>
          )}

          {/* ====== AUDIT TEHNIC ====== */}
          {stage === 'tehnic' && (
            <div className="space-y-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                  Întrebarea {techStep + 1} din {TECH_QUESTIONS.length}
                </span>
              </div>

              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">{currentQ.icon}</span>
                  <h3 className="text-lg font-bold text-slate-800">{currentQ.label}</h3>
                </div>
                <div className="space-y-2">
                  {currentQ.options.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => selectTechAnswer(currentQ.id, opt.value)}
                      className={`
                        w-full p-4 rounded-xl border-2 text-left transition-all duration-200
                        ${techAnswers[currentQ.id] === opt.value
                          ? 'border-amber-400 bg-amber-50'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'}
                      `}
                    >
                      <span className={`font-semibold text-sm ${techAnswers[currentQ.id] === opt.value ? 'text-amber-700' : 'text-slate-700'}`}>
                        {opt.label}
                      </span>
                      <span className="text-xs text-slate-500 ml-2">{opt.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {techStep > 0 && (
                <button
                  onClick={() => setTechStep((s) => s - 1)}
                  className="text-sm text-slate-400 hover:text-slate-600 transition-colors"
                >
                  ← Înapoi
                </button>
              )}
            </div>
          )}

          {/* ====== REZULTATE ====== */}
          {stage === 'rezultate' && (
            <div className="space-y-6">

              {/* Compatibilitate tehnică */}
              {techResult ? (
              <div>
                <h3 className="text-base font-bold text-slate-800 mb-3 flex items-center gap-2">
                  🖥️ Compatibilitate Tehnică - {erpName}
                </h3>
                <div className="flex items-center gap-4 mb-3">
                  <div className={`text-4xl font-black ${techResult.score >= 75 ? 'text-green-600' : techResult.score >= 50 ? 'text-amber-500' : 'text-red-500'}`}>
                    {techResult.score}%
                  </div>
                  <div className="flex-1">
                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${techResult.score >= 75 ? 'bg-green-500' : techResult.score >= 50 ? 'bg-amber-400' : 'bg-red-400'}`}
                        style={{ width: `${techResult.score}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {techResult.score >= 75 ? 'Infrastructura curentă este compatibilă cu ' + erpName
                        : techResult.score >= 50 ? 'Compatibilitate parțială - ajustări minore necesare'
                        : 'Sunt necesare modificări de infrastructură înainte de implementare'}
                    </p>
                  </div>
                </div>
                {techResult.notes.length > 0 && (
                  <div className="space-y-2">
                    {techResult.notes.map((n, i) => (
                      <div key={i} className="flex gap-2 p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs text-slate-600">
                        <span className="flex-shrink-0">💡</span>
                        <span>{n}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              ) : (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-sm text-slate-500 text-center">
                  Auditul tehnic nu a fost completat. Completați întrebările tehnice pentru a vedea scorul de compatibilitate.
                </div>
              )}

              <button
                onClick={onClose}
                className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 rounded-xl transition-all text-sm"
              >
                Închide Analiza Premium
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
