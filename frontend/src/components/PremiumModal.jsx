import { useState } from 'react';

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

// Compatibilitate ERP cu configurația tehnică
function calcTechCompatibility(techAnswers, erpName) {
  let score = 100;
  const notes = [];

  const os = techAnswers.os_tip;
  const net = techAnswers.retea_tip;
  const fw  = techAnswers.firewall;
  const sec = techAnswers.securitate;

  if (erpName === 'WinMentor') {
    if (os === 'linux')     { score -= 30; notes.push('WinMentor nu rulează nativ pe Linux - necesită Windows sau VM'); }
    if (os === 'macos')     { score -= 35; notes.push('WinMentor este exclusiv Windows - pe macOS necesită VM (Parallels, VMware Fusion)'); }
    if (os === 'mix')       { score -= 15; notes.push('Stațiile non-Windows necesită VM sau acces Remote Desktop pentru WinMentor'); }
    if (os === 'windows10') { score -= 5;  notes.push('Windows 10 suportat, dar Windows 11 sau Server recomandat'); }
    if (net === 'workgroup'){ score -= 10; notes.push('Workgroup funcționează, dar domeniu Windows recomandabil pentru multi-user'); }
  }

  if (erpName === 'Saga') {
    if (os === 'linux')     { score -= 25; notes.push('Saga rulează pe Windows; pe Linux necesită Wine sau VM'); }
    if (os === 'macos')     { score -= 30; notes.push('Saga nu are versiune nativă macOS - necesită VM (Parallels) sau acces Remote Desktop'); }
    if (os === 'mix')       { score -= 10; notes.push('Utilizatorii Mac/Linux necesită Remote Desktop sau VM pentru acces Saga'); }
    if (net === 'workgroup'){ score -= 5;  notes.push('Funcționează în workgroup, dar performanța pe rețea partajată e limitată'); }
  }

  if (erpName === 'UNA.md') {
    if (os === 'linux')     { score -= 20; notes.push('UNA.md preferă Windows Server; Linux suportat parțial'); }
    if (os === 'macos')     { score -= 25; notes.push('UNA.md nu are client nativ macOS - acces prin Remote Desktop sau browser (modul web)'); }
    if (os === 'mix')       { score -= 10; notes.push('Stațiile non-Windows pot accesa UNA prin modulul web, cu funcționalitate limitată'); }
    if (net === 'workgroup'){ score -= 15; notes.push('Recomandă domeniu Windows pentru acces multi-utilizator stabil'); }
  }

  if (erpName === 'Odoo') {
    if (os === 'linux' || os === 'mix') { score += 5; notes.push('Odoo rulează nativ pe Linux - configurație ideală'); }
    if (os === 'macos')     { score += 3; notes.push('Odoo se accesează din browser - macOS este pe deplin compatibil fără configurare suplimentară'); }
    if (os === 'windows10' || os === 'windows11') { score -= 5; notes.push('Odoo pe Windows necesită configurare suplimentară (WSL sau Docker) pentru server'); }
    if (net === 'cloud' || net === 'hibrid') { score += 5; notes.push('Arhitectura cloud-first a Odoo se potrivește perfect cu infrastructura ta'); }
    if (fw === 'cloud_fw' || fw === 'utm')   { score += 5; notes.push('Firewall avansat compatibil cu deployment cloud Odoo'); }
  }

  if (sec === 'iso27001' || sec === 'advanced') {
    notes.push('Politicile de securitate avansate sunt compatibile cu toate sistemele ERP analizate');
  }
  if (sec === 'basic' && (erpName === 'Odoo' || erpName === 'UNA.md')) {
    score -= 5;
    notes.push('Se recomandă cel puțin MFA pentru accesul la ERP cloud/web');
  }

  return { score: Math.min(100, Math.max(0, score)), notes };
}

// Calculator TCO
function calcTCO(tcoData, erpName) {
  const oreManuale    = parseFloat(tcoData.ore_manuale)    || 0;
  const nrAngajati    = parseFloat(tcoData.nr_angajati_erp)|| 0;
  const costOrar      = parseFloat(tcoData.cost_orar)      || 0;
  const costImpl      = parseFloat(tcoData.cost_implementare) || 0;

  const costuriActuale   = oreManuale * nrAngajati * costOrar * 52; // anual
  const reducereEstimata = 0.65; // ERP reduce procesele manuale cu ~65%
  const economiiAnuale   = costuriActuale * reducereEstimata;

  const costuriErp = {
    'WinMentor': { licenta: 1200,  mentenanta: 600,  implementare: costImpl || 3000  },
    'Saga':      { licenta: 800,   mentenanta: 400,  implementare: costImpl || 2000  },
    'UNA.md':{ licenta: 2500, mentenanta: 1000, implementare: costImpl || 5000  },
    'Odoo':      { licenta: 0,     mentenanta: 1500, implementare: costImpl || 8000  },
  };

  const costuri = costuriErp[erpName] || costuriErp['Saga'];
  const tco1an  = costuri.licenta + costuri.mentenanta + costuri.implementare;
  const tco3ani = costuri.licenta + costuri.mentenanta * 3 + costuri.implementare;
  const breakEvenLuni = economiiAnuale > 0
    ? Math.ceil((tco1an / economiiAnuale) * 12)
    : null;

  return { costuriActuale, economiiAnuale, tco1an, tco3ani, breakEvenLuni, costuri };
}

// ============================================================
// Componenta principală
// ============================================================
export default function PremiumModal({ onClose, profile, scores, erpRecomandat }) {
  const [stage, setStage] = useState('paywall'); // paywall | tehnic | tco | rezultate
  const [techStep, setTechStep] = useState(0);
  const [techAnswers, setTechAnswers] = useState({});
  const [tcoData, setTcoData] = useState({
    ore_manuale: '',
    nr_angajati_erp: '',
    cost_orar: '',
    cost_implementare: '',
  });
  const [tcoError, setTcoError] = useState('');

  const erpName = erpRecomandat?.name || 'Saga';
  const currentQ = TECH_QUESTIONS[techStep];

  const selectTechAnswer = (qId, val) => {
    const updated = { ...techAnswers, [qId]: val };
    setTechAnswers(updated);
    setTimeout(() => {
      if (techStep < TECH_QUESTIONS.length - 1) {
        setTechStep((s) => s + 1);
      } else {
        setStage('tco');
      }
    }, 300);
  };

  const handleTCOSubmit = () => {
    if (!tcoData.ore_manuale || !tcoData.nr_angajati_erp || !tcoData.cost_orar) {
      setTcoError('Completați câmpurile obligatorii (primele 3).');
      return;
    }
    setTcoError('');
    setStage('rezultate');
  };

  const techResult  = stage === 'rezultate' ? calcTechCompatibility(techAnswers, erpName) : null;
  const tcoResult   = stage === 'rezultate' ? calcTCO(tcoData, erpName) : null;

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
                <p className="text-amber-100 text-sm">Audit tehnic avansat + Calculator TCO</p>
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
          {stage !== 'paywall' && stage !== 'rezultate' && (
            <div className="mt-4 flex gap-1">
              {['tehnic', 'tco'].map((s, i) => (
                <div
                  key={s}
                  className={`h-1.5 flex-1 rounded-full transition-all ${
                    (stage === 'tehnic' && i === 0) || (stage === 'tco' && i <= 1)
                      ? 'bg-white' : 'bg-white/30'
                  }`}
                />
              ))}
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
                  Raportul premium include audit tehnic detaliat și calculator de rentabilitate.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { icon: '🖥️', title: 'Compatibilitate OS & Rețea',  desc: 'Analiza compatibilității ERP cu Windows, Linux, domeniu, workgroup' },
                  { icon: '🧱', title: 'Audit Firewall & Securitate',  desc: 'Evaluarea politicilor de securitate și infrastructurii de rețea' },
                  { icon: '💰', title: 'Calculator TCO 3 ani',         desc: 'Cost total de proprietate și break-even față de procesele actuale' },
                  { icon: '📈', title: 'ROI & Economii Estimate',      desc: 'Economii anuale estimate prin automatizarea proceselor manuale' },
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

          {/* ====== CALCULATOR TCO ====== */}
          {stage === 'tco' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">Calculator TCO & ROI</h3>
                <p className="text-sm text-slate-500">Introduceți datele actuale pentru a calcula economiile estimate după implementarea ERP.</p>
              </div>

              <div className="space-y-4">
                {[
                  { key: 'ore_manuale',     label: 'Ore/săptămână pierdute pe procese manuale *', placeholder: 'ex: 20', suffix: 'ore/săpt.' },
                  { key: 'nr_angajati_erp', label: 'Număr angajați care vor folosi ERP *',        placeholder: 'ex: 10', suffix: 'angajați' },
                  { key: 'cost_orar',       label: 'Cost orar mediu per angajat *',               placeholder: 'ex: 15', suffix: '€/oră' },
                  { key: 'cost_implementare', label: 'Buget implementare estimat (opțional)',     placeholder: 'ex: 5000', suffix: '€' },
                ].map((f) => (
                  <div key={f.key}>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">{f.label}</label>
                    <div className="flex items-center border-2 border-slate-200 rounded-xl overflow-hidden focus-within:border-amber-400 transition-colors">
                      <input
                        type="number"
                        min="0"
                        value={tcoData[f.key]}
                        onChange={(e) => setTcoData({ ...tcoData, [f.key]: e.target.value })}
                        placeholder={f.placeholder}
                        className="flex-1 px-4 py-3 text-sm outline-none bg-white"
                      />
                      <span className="px-3 py-3 bg-slate-50 text-slate-500 text-xs border-l border-slate-200 whitespace-nowrap">
                        {f.suffix}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {tcoError && <p className="text-red-500 text-xs">⚠ {tcoError}</p>}

              <button
                onClick={handleTCOSubmit}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold py-3 rounded-xl transition-all shadow-sm text-sm"
              >
                Calculează Analiza Completă →
              </button>
            </div>
          )}

          {/* ====== REZULTATE ====== */}
          {stage === 'rezultate' && techResult && tcoResult && (
            <div className="space-y-6">

              {/* Compatibilitate tehnică */}
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

              <hr className="border-slate-100" />

              {/* TCO */}
              <div>
                <h3 className="text-base font-bold text-slate-800 mb-3 flex items-center gap-2">
                  💰 Calculator TCO & ROI - {erpName}
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Costuri manuale actuale/an', value: `${tcoResult.costuriActuale.toLocaleString('ro-RO')} €`, color: 'text-red-600', bg: 'bg-red-50' },
                    { label: 'Economii estimate/an',       value: `${Math.round(tcoResult.economiiAnuale).toLocaleString('ro-RO')} €`, color: 'text-green-600', bg: 'bg-green-50' },
                    { label: 'TCO primul an',              value: `${tcoResult.tco1an.toLocaleString('ro-RO')} €`, color: 'text-slate-700', bg: 'bg-slate-50' },
                    { label: 'TCO pe 3 ani',               value: `${tcoResult.tco3ani.toLocaleString('ro-RO')} €`, color: 'text-slate-700', bg: 'bg-slate-50' },
                  ].map((item) => (
                    <div key={item.label} className={`p-4 rounded-xl ${item.bg} border border-slate-100`}>
                      <p className="text-xs text-slate-500 mb-1">{item.label}</p>
                      <p className={`text-xl font-black ${item.color}`}>{item.value}</p>
                    </div>
                  ))}
                </div>

                {tcoResult.breakEvenLuni !== null && (
                  <div className="mt-3 p-4 bg-amber-50 rounded-xl border border-amber-100 flex items-center gap-3">
                    <span className="text-2xl">⏱️</span>
                    <div>
                      <p className="font-bold text-amber-800 text-sm">
                        Break-even în {tcoResult.breakEvenLuni} {tcoResult.breakEvenLuni === 1 ? 'lună' : 'luni'}
                      </p>
                      <p className="text-amber-700 text-xs">
                        Investiția se amortizează în aproximativ {Math.ceil(tcoResult.breakEvenLuni / 12 * 10) / 10} {tcoResult.breakEvenLuni <= 12 ? 'an' : 'ani'}
                      </p>
                    </div>
                  </div>
                )}

                {tcoResult.costuriActuale === 0 && (
                  <p className="text-xs text-slate-400 mt-2 italic">
                    * Introduceți date reale pentru calcule precise. Valorile de mai sus sunt estimative bazate pe medii de piață.
                  </p>
                )}
              </div>

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
