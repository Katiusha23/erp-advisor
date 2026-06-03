// ============================================================
// Logica de calcul al scorurilor și recomandărilor ERP
// Toate calculele se efectuează pe frontend, fără apeluri API
// ============================================================

// ------------------------------------------------------------
// Definirea celor 5 dimensiuni ale auditului ERP
// Fiecare dimensiune are o întrebare cu 4 opțiuni (scor 1–4)
// ------------------------------------------------------------
export const DIMENSIONS = [
  {
    id: 'procese',
    label: 'Procese Interne',
    description: 'Gradul de maturitate al proceselor de business',
    icon: '⚙️',
    question: 'Care este starea actuală a proceselor interne ale companiei dumneavoastră?',
    options: [
      { score: 1, text: 'Procese complet manuale, fără documentație sau standarde definite' },
      { score: 2, text: 'Procese parțial documentate, gestionate prin Excel și registre pe hârtie' },
      { score: 3, text: 'Procese documentate, utilizăm câteva aplicații software dedicate' },
      { score: 4, text: 'Procese optimizate și standardizate, sisteme parțial integrate între ele' },
    ],
  },
  {
    id: 'financiar',
    label: 'Resurse Financiare',
    description: 'Disponibilitatea și alocarea bugetului pentru ERP',
    icon: '💰',
    question: 'Cum descrieți situația financiară a companiei în raport cu un proiect ERP?',
    options: [
      { score: 1, text: 'Nu avem buget alocat, investiția în ERP nu este o prioritate actuală' },
      { score: 2, text: 'Buget limitat, depindem parțial de granturi sau finanțare externă' },
      { score: 3, text: 'Buget parțial alocat intern, cu posibilitate de suplimentare' },
      { score: 4, text: 'Buget clar definit, aprobat de management și disponibil imediat' },
    ],
  },
  {
    id: 'it',
    label: 'Capacitate IT',
    description: 'Infrastructura tehnică și expertiza internă IT',
    icon: '💻',
    question: 'Cum arată capacitatea IT a companiei dumneavoastră în prezent?',
    options: [
      { score: 1, text: 'Nu avem departament IT, angajații au cunoștințe tehnice minime' },
      { score: 2, text: '1–2 persoane IT cu cunoștințe de bază în rețele și suport tehnic' },
      { score: 3, text: 'Echipă IT mică cu experiență în software de business și baze de date' },
      { score: 4, text: 'Echipă IT dedicată cu experiență documentată în implementări ERP' },
    ],
  },
  {
    id: 'echipa',
    label: 'Pregătire Echipă',
    description: 'Gradul de adoptare și entuziasmul echipei față de schimbare',
    icon: '👥',
    question: 'Care este atitudinea generală a echipei față de implementarea unui sistem ERP?',
    options: [
      { score: 1, text: 'Rezistență puternică la schimbare, conceptul ERP este necunoscut majorității' },
      { score: 2, text: 'Interes scăzut, ar necesita un efort mare de convingere și training' },
      { score: 3, text: 'Echipa este deschisă, există câțiva campioni interni ai proiectului' },
      { score: 4, text: 'Echipă entuziastă, avem deja champions desemnați și un plan de adopție' },
    ],
  },
  {
    id: 'conformitate',
    label: 'Conformitate Legislativă',
    description: 'Nivelul de conformitate cu cerințele legale și de raportare',
    icon: '📋',
    question: 'Cum gestionați în prezent conformitatea legislativă și raportările obligatorii?',
    options: [
      { score: 1, text: 'Conformitate minimă, avem probleme frecvente cu autoritățile fiscale' },
      { score: 2, text: 'Conformitate parțială, unele raportări se fac cu întârzieri sau erori' },
      { score: 3, text: 'Conformitate bună, documentația este în regulă și raportările sunt la timp' },
      { score: 4, text: 'Conformitate exemplară, suntem pregătiți oricând pentru un audit extern' },
    ],
  },
];

// ------------------------------------------------------------
// Calculare scor procentual pentru o singură dimensiune
// rawScore: 1–4  →  rezultat: 0–100%
// ------------------------------------------------------------
export const calculateDimensionScore = (rawScore) =>
  Math.round(((rawScore - 1) / 3) * 100);

// ------------------------------------------------------------
// Calculare scor total procentual pe baza tuturor scorurilor
// scores: { procese: 3, financiar: 2, it: 4, echipa: 3, conformitate: 2 }
// rezultat: 0–100
// ------------------------------------------------------------
export const calculateTotalScore = (scores) => {
  if (!scores || Object.keys(scores).length === 0) return 0;
  const vals = Object.values(scores).filter(v => v > 0);
  if (vals.length === 0) return 0;
  const sum = vals.reduce((a, b) => a + b, 0);
  return Math.round((sum / (vals.length * 4)) * 100);
};

// ------------------------------------------------------------
// Verdict bazat pe scorul total
// ≥75% → verde, 45–74% → galben, <45% → roșu
// ------------------------------------------------------------
export const getVerdict = (totalScore) => {
  if (totalScore >= 75) {
    return {
      level: 'high',
      label: 'Pregătit pentru ERP',
      color: 'green',
      bgClass: 'bg-green-50 border-green-300',
      textClass: 'text-green-700',
      badgeClass: 'bg-green-100 text-green-800',
      hex: '#16a34a',
    };
  }
  if (totalScore >= 45) {
    return {
      level: 'medium',
      label: 'Pregătire Parțială',
      color: 'yellow',
      bgClass: 'bg-yellow-50 border-yellow-300',
      textClass: 'text-yellow-700',
      badgeClass: 'bg-yellow-100 text-yellow-800',
      hex: '#d97706',
    };
  }
  return {
    level: 'low',
    label: 'Necesită Pregătire',
    color: 'red',
    bgClass: 'bg-red-50 border-red-300',
    textClass: 'text-red-700',
    badgeClass: 'bg-red-100 text-red-800',
    hex: '#dc2626',
  };
};

// ------------------------------------------------------------
// Cele 4 sisteme ERP comparate
// ------------------------------------------------------------
const ERP_SYSTEMS = [
  {
    id: 'winmentor',
    name: 'WinMentor',
    vendor: 'WinMentor SRL',
    logo: '🏭',
    country: 'RO',
    description: 'Soluție ERP lider în România, ideală pentru IMM-uri din producție și comerț. Integrare nativă cu legislația fiscală românească.',
    pros: ['Suport dedicat în limba română', 'Integrare nativă cu ANAF și contabilitate RO', 'Implementare rapidă (2–4 luni)', 'Preț competitiv pentru piața locală'],
    cons: ['Disponibil exclusiv în România', 'Funcționalități de BI limitate față de soluții internaționale'],
    budgetRange: ['sub5k', '5-15k', '15-40k'],
    minITScore: 1,
    industries: ['Producție', 'Comerț', 'Retail'],
  },
  {
    id: 'unasoft',
    name: 'UNA Unisoft',
    vendor: 'Unisoft SRL',
    logo: '🇲🇩',
    country: 'MD',
    description: 'Soluție ERP adaptată specificului pieței din Moldova, conformă cu legislația fiscală și contabilă locală.',
    pros: ['Conformitate completă cu legislația Republicii Moldova', 'Suport local dedicat', 'Preț accesibil pentru IMM-uri moldovene', 'Interfață în română și rusă'],
    cons: ['Funcționalități limitate față de ERP-uri internaționale', 'Comunitate de utilizatori mică', 'Integrări terțe limitate'],
    budgetRange: ['sub5k', '5-15k', '15-40k'],
    minITScore: 1,
    industries: ['Producție', 'Comerț', 'Servicii', 'Retail'],
  },
  {
    id: 'saga',
    name: 'Saga Software',
    vendor: 'Saga Software SRL',
    logo: '📊',
    country: 'both',
    description: 'Soluție accesibilă pentru firme mici, cu focus pe contabilitate, gestiune stocuri și facturare.',
    pros: ['Cel mai accesibil preț din piață', 'Ușor de utilizat, training minim', 'Suport tehnic rapid', 'Potrivit pentru firme cu 1–30 angajați'],
    cons: ['Funcționalități limitate pentru producție complexă', 'Scalabilitate redusă la creșterea companiei', 'Fără module avansate de HR sau proiecte'],
    budgetRange: ['sub5k', '5-15k'],
    minITScore: 1,
    industries: ['Servicii', 'Retail', 'Comerț'],
  },
  {
    id: 'odoo',
    name: 'Odoo Community',
    vendor: 'Odoo SA (Open Source)',
    logo: '🌐',
    country: 'both',
    description: 'ERP open-source modular, cu cel mai mare ecosistem de module și integrări. Gratuit, dar necesită expertiză IT pentru implementare.',
    pros: ['100% gratuit (versiunea Community)', 'Extrem de modular — plătești doar ce folosești', 'Comunitate globală vastă cu suport activ', 'Integrări native cu 1000+ aplicații', 'Scalabil de la 5 la 500+ angajați'],
    cons: ['Necesită expertiză IT solidă pentru implementare', 'Costurile de implementare pot depăși licența soluțiilor comerciale', 'Suport oficial contra cost (Odoo Enterprise)'],
    budgetRange: ['5-15k', '15-40k', 'peste40k'],
    minITScore: 2,
    industries: ['Producție', 'Comerț', 'Servicii', 'Retail', 'Construcții'],
  },
];

// ------------------------------------------------------------
// Calculare scor de compatibilitate pentru fiecare sistem ERP
// Returnează lista sortată descrescător după compatibilitate
// ------------------------------------------------------------
export const calculateERPCompatibility = (profile, scores) => {
  const totalScore = calculateTotalScore(scores);
  const itScore    = scores.it || 0;
  const { buget, tara, industrie } = profile;

  return ERP_SYSTEMS.map((erp) => {
    let compat = 40; // Bază neutră

    // Factor 1: Compatibilitate geografică (25 pts max)
    if (erp.country === tara)    compat += 25;
    else if (erp.country === 'both') compat += 12;
    else                         compat -= 15;

    // Factor 2: Buget (20 pts max)
    if (erp.budgetRange.includes(buget)) compat += 20;
    else                                  compat -= 10;

    // Factor 3: Capacitate IT (15 pts max)
    if (itScore >= erp.minITScore + 1) compat += 15;
    else if (itScore === erp.minITScore) compat += 5;
    else                               compat -= 15;

    // Factor 4: Industrie preferată (10 pts max)
    if (erp.industries.includes(industrie)) compat += 10;

    // Factor 5: Scor total — Odoo necesită pregătire mai bună
    if (erp.id === 'odoo' && totalScore >= 70) compat += 12;
    if (erp.id === 'odoo' && totalScore < 45)  compat -= 18;

    // Factor 6: WinMentor favorizat pentru producție/comerț România
    if (erp.id === 'winmentor' && tara === 'RO' && ['Producție', 'Comerț'].includes(industrie)) compat += 10;

    // Factor 7: Saga pentru bugete mici și companii mici
    if (erp.id === 'saga' && buget === 'sub5k') compat += 8;

    // Clampare la intervalul [0, 100]
    compat = Math.max(0, Math.min(100, compat));

    return { ...erp, compatibility: Math.round(compat) };
  }).sort((a, b) => b.compatibility - a.compatibility);
};

// ------------------------------------------------------------
// Recomandare metodologie de implementare bazată pe scorul total
// Agile ≥70%, Hibridă 45–69%, Waterfall <45%
// ------------------------------------------------------------
export const getMethodology = (totalScore) => {
  if (totalScore >= 70) {
    return {
      name: 'Metodologie Agile / Iterativă',
      shortName: 'Agile',
      icon: '⚡',
      color: '#3b82f6',
      bgClass: 'bg-blue-50 border-blue-200',
      duration: '4 – 8 luni',
      description:
        'Compania dumneavoastră are o pregătire excelentă pentru ERP. Recomandăm o abordare Agile cu sprinturi de 2–4 săptămâni, livrare rapidă a valorii și adaptare continuă la feedback.',
      phases: [
        {
          step: 1,
          title: 'Sprint 0 — Configurare & Setup',
          duration: '2 săptămâni',
          desc: 'Configurarea mediului tehnic, instalarea ERP, definirea modulelor prioritare, training pentru echipa cheie.',
        },
        {
          step: 2,
          title: 'Sprinturi 1–N — Implementare Iterativă',
          duration: '2 – 6 luni',
          desc: 'Implementare modul cu modul în sprinturi scurte, demonstrații bi-săptămânale cu utilizatorii, ajustare continuă.',
        },
        {
          step: 3,
          title: 'Go-Live & Optimizare',
          duration: '2 – 4 săptămâni',
          desc: 'Lansare în producție, suport intensiv post-lansare, colectare feedback și optimizare configurații.',
        },
      ],
    };
  }

  if (totalScore >= 45) {
    return {
      name: 'Metodologie Hibridă (Agile + Waterfall)',
      shortName: 'Hibridă',
      icon: '🔄',
      color: '#f59e0b',
      bgClass: 'bg-yellow-50 border-yellow-200',
      duration: '6 – 12 luni',
      description:
        'Compania are o pregătire moderată. Recomandăm o metodologie hibridă: planificare detaliată la început (Waterfall) combinată cu execuție iterativă (Agile) pentru flexibilitate.',
      phases: [
        {
          step: 1,
          title: 'Analiză & Proiectare',
          duration: '1 – 2 luni',
          desc: 'Analiza proceselor actuale (As-Is), maparea în ERP (To-Be), definirea cerințelor și elaborarea planului detaliat de implementare.',
        },
        {
          step: 2,
          title: 'Implementare pe Module',
          duration: '3 – 8 luni',
          desc: 'Implementare secvențială pe module, training progresiv al utilizatorilor, sesiuni de validare la finalul fiecărei etape.',
        },
        {
          step: 3,
          title: 'Stabilizare & Lansare',
          duration: '1 – 2 luni',
          desc: 'Teste de acceptanță, migrarea datelor istorice, lansare controlată (pilot → producție), suport post-implementare.',
        },
      ],
    };
  }

  return {
    name: 'Metodologie Waterfall / Clasică',
    shortName: 'Waterfall',
    icon: '📋',
    color: '#ef4444',
    bgClass: 'bg-red-50 border-red-200',
    duration: '9 – 18 luni',
    description:
      'Compania necesită pregătire suplimentară înainte de implementarea ERP. Recomandăm abordarea Waterfall clasică cu etape bine definite, documentație completă și validare formală la fiecare fază.',
    phases: [
      {
        step: 1,
        title: 'Pregătire & Fundamentare',
        duration: '2 – 4 luni',
        desc: 'Optimizarea proceselor interne, training general echipă, audit IT și infrastructură, alocarea formală a bugetului și resurselor.',
      },
      {
        step: 2,
        title: 'Implementare Structurată',
        duration: '4 – 10 luni',
        desc: 'Implementare secvențială strictă modul cu modul, validare completă și semnare formală la finalul fiecărei etape.',
      },
      {
        step: 3,
        title: 'Lansare & Consolidare',
        duration: '2 – 4 luni',
        desc: 'Lansare graduală (departament cu departament), suport intensiv, consolidarea cunoștințelor și documentarea procedurilor.',
      },
    ],
  };
};

// ------------------------------------------------------------
// Formatare etichete pentru buget (folosit în UI și PDF)
// ------------------------------------------------------------
export const formatBuget = (buget) => {
  const map = {
    'sub5k':    'Sub 5.000 €',
    '5-15k':    '5.000 € – 15.000 €',
    '15-40k':   '15.000 € – 40.000 €',
    'peste40k': 'Peste 40.000 €',
  };
  return map[buget] || buget || '—';
};
