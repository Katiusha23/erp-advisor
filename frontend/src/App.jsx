import { useState } from 'react';
import Stepper from './components/Stepper.jsx';
import PlanStep from './components/PlanStep.jsx';
import ProfileStep from './components/ProfileStep.jsx';
import AuditStep from './components/AuditStep.jsx';
import ResultsStep from './components/ResultsStep.jsx';
import RecommendationStep from './components/RecommendationStep.jsx';

const INITIAL_PROFILE = {
  tara: 'RO',
  nr_angajati: 50,
  industrie_categorie: '',
  industrie: '',
  buget: '',
  are_erp: '',
  erp_existent: '',
  email: '',
};

const INITIAL_SCORES = {
  procese: 0,
  financiar: 0,
  it: 0,
  echipa: 0,
  conformitate: 0,
  securitate: 0,
  infrastructura_date: 0,
  aplicatii_sw: 0,
  prezenta_online: 0,
  colaborare: 0,
};

const STEP_LABELS = [
  'Profilul Companiei',
  'Evaluare ERP',
  'Rezultate',
  'Recomandare ERP',
];

export default function App() {
  const [plan, setPlan]                     = useState(null);
  const [currentStep, setCurrentStep]       = useState(0);
  const [profile, setProfile]               = useState(INITIAL_PROFILE);
  const [scores, setScores]                 = useState(INITIAL_SCORES);
  const [techAnswers, setTechAnswers]        = useState({});
  const [tcoData,     setTcoData]           = useState({});
  const [benchmarkData, setBenchmarkData]   = useState(null);

  const goNext  = () => setCurrentStep((s) => Math.min(s + 1, 3));
  const goPrev  = () => setCurrentStep((s) => Math.max(s - 1, 0));

  const resetApp = () => {
    setPlan(null);
    setCurrentStep(0);
    setProfile(INITIAL_PROFILE);
    setScores(INITIAL_SCORES);
    setTechAnswers({});
    setTcoData({});
    setBenchmarkData(null);
  };

  const stepComponents = [
    <ProfileStep key="profil" profile={profile} onChange={setProfile} onNext={goNext} />,
    <AuditStep
      key="audit"
      scores={scores}
      onChange={setScores}
      profile={profile}
      plan={plan}
      techAnswers={techAnswers}
      onTechChange={setTechAnswers}
      tcoData={tcoData}
      onTcoChange={setTcoData}
      onNext={goNext}
      onPrev={goPrev}
    />,
    <ResultsStep
      key="rezultate"
      profile={profile}
      scores={scores}
      benchmarkData={benchmarkData}
      setBenchmarkData={setBenchmarkData}
      onNext={goNext}
      onPrev={goPrev}
    />,
    <RecommendationStep
      key="recomandare"
      profile={profile}
      scores={scores}
      techAnswers={techAnswers}
      tcoData={tcoData}
      benchmarkData={benchmarkData}
      plan={plan}
      onReset={resetApp}
      onPrev={goPrev}
    />,
  ];

  if (!plan) {
    return (
      <div className="min-h-screen bg-slate-50">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800 leading-tight">ERP Advisor</h1>
              <p className="text-xs text-slate-500 hidden sm:block">Evaluare pregătire ERP pentru IMM-uri</p>
            </div>
          </div>
        </header>
        <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
          <PlanStep onSelect={(p) => setPlan(p)} />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800 leading-tight">ERP Advisor</h1>
              <p className="text-xs text-slate-500 hidden sm:block">Evaluare pregătire ERP pentru IMM-uri</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`border px-3 py-1 rounded text-xs font-medium hidden sm:inline-flex items-center gap-1 ${
              plan === 'premium'
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-slate-50 text-slate-600 border-slate-200'
            }`}>
              {plan === 'premium' ? 'Premium' : 'Basic'}
            </span>
            {currentStep > 0 && (
              <button
                onClick={resetApp}
                className="text-xs text-slate-400 hover:text-slate-600 transition-colors px-2 py-1 rounded hover:bg-slate-100"
              >
                Restart
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 pb-16">
        <Stepper steps={STEP_LABELS} currentStep={currentStep} />
        <div key={currentStep} className="animate-slide-up">
          {stepComponents[currentStep]}
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white py-6">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-xs text-slate-400">
            ERP Advisor © {new Date().getFullYear()} - Instrument de evaluare ERP pentru IMM-uri din România și Moldova
          </p>
        </div>
      </footer>
    </div>
  );
}
