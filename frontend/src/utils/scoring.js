// ============================================================
// Logica de calcul al scorurilor și recomandărilor ERP
// ============================================================

// ------------------------------------------------------------
// Categorii și subcategorii industrii (selecție în 2 pași)
// ------------------------------------------------------------
export const INDUSTRY_CATEGORIES = [
  { id: 'Producție',            icon: '🏭', label: 'Producție' },
  { id: 'Comerț & Distribuție', icon: '🛒', label: 'Comerț & Distribuție' },
  { id: 'Servicii',             icon: '💼', label: 'Servicii' },
  { id: 'IT & Tehnologie',      icon: '💻', label: 'IT & Tehnologie' },
  { id: 'Construcții',          icon: '🏗️', label: 'Construcții' },
  { id: 'Non-profit & ONG',     icon: '🤝', label: 'Non-profit & ONG' },
];

export const INDUSTRY_SUBCATEGORIES = {
  'Producție': [
    'Alimentară & Băuturi',
    'Automotive & Piese Auto',
    'Farmaceutică & Chimică',
    'Textile & Îmbrăcăminte',
    'Electrocasnice & Electronică',
    'Mobilă & Prelucrarea Lemnului',
    'Altă producție industrială',
  ],
  'Comerț & Distribuție': [
    'Retail alimentar (FMCG)',
    'Retail non-alimentar',
    'E-commerce & Online',
    'Distribuție en-gros',
    'Import-export',
  ],
  'Servicii': [
    'Servicii profesionale (consultanță, juridic, contabilitate)',
    'Servicii medicale & farmacii',
    'HoReCa (hotel, restaurant, cafenea)',
    'Transport & Logistică',
    'Educație & Training',
    'Media & Publicitate',
    'Alte servicii',
  ],
  'IT & Tehnologie': [
    'Dezvoltare software & aplicații',
    'Servicii IT & Outsourcing',
    'Telecomunicații',
  ],
  'Construcții': [
    'Construcții civile & industriale',
    'Real Estate & Imobiliare',
    'Instalații & Finisaje',
  ],
  'Non-profit & ONG': [
    'ONG & Asociații',
    'Fundații',
    'Organizații culturale & religioase',
  ],
};

// ------------------------------------------------------------
// Întrebări despre procese specifice fiecărei industrii
// Mapate pe industrie_categorie; AuditStep alege întrebarea
// potrivită; fallback pe PROCESS_QUESTIONS.default
// ------------------------------------------------------------
export const PROCESS_QUESTIONS = {
  'Producție': {
    question: 'Cum sunt gestionate procesele de producție (planificare, urmărire loturi, gestiune materii prime și stocuri de produse finite)?',
    options: [
      { score: 1, text: 'Producția este planificată verbal sau pe hârtie, fără documentație de lot sau standarde de calitate definite' },
      { score: 2, text: 'Planificare parțial documentată; stocurile de materii prime și produse finite sunt urmărite în Excel' },
      { score: 3, text: 'Software de gestiune stocuri sau producție moștenit, neintegrat cu contabilitatea sau comenzile' },
      { score: 4, text: 'Procese de producție standardizate, cu urmărire loturi și integrare parțială între producție, stocuri și facturare' },
    ],
  },
  'Comerț & Distribuție': {
    question: 'Cum sunt gestionate comenzile, stocurile de marfă și relațiile cu furnizorii și rețeaua de distribuție?',
    options: [
      { score: 1, text: 'Comenzile și stocurile sunt gestionate manual (telefon, hârtie), fără un sistem informatic dedicat' },
      { score: 2, text: 'Stocuri urmărite în Excel; comenzile sunt procesate prin e-mail sau telefon, fără automatizare' },
      { score: 3, text: 'Software de gestiune stocuri și facturare, neintegrat cu CRM sau canalele de vânzare' },
      { score: 4, text: 'Comenzi, stocuri și livrări parțial integrate, cu vizibilitate în timp real și sincronizare cu furnizorii' },
    ],
  },
  'Servicii': {
    question: 'Cum sunt gestionate proiectele, contractele de servicii, facturile și relațiile cu clienții?',
    options: [
      { score: 1, text: 'Proiectele și facturile sunt gestionate verbal sau pe hârtie, fără evidențe sistematice' },
      { score: 2, text: 'Contracte și facturi create în Word/Excel; urmărirea proiectelor se face informal, fără un sistem dedicat' },
      { score: 3, text: 'Software de facturare și urmărire proiecte izolat, fără integrare cu contabilitatea sau CRM-ul' },
      { score: 4, text: 'Procese documentate; CRM și facturare parțial integrate; urmărire ore și buget per proiect disponibilă' },
    ],
  },
  'IT & Tehnologie': {
    question: 'Cum sunt gestionate proiectele tehnice, resursele umane, livrabilele și relațiile cu clienții sau partenerii?',
    options: [
      { score: 1, text: 'Proiectele sunt gestionate informal, fără unelte de project management sau CRM' },
      { score: 2, text: 'Utilizăm foi de calcul sau unelte gratuite (Trello, e-mail) fără integrare sau raportare centralizată' },
      { score: 3, text: 'Unelte de PM (Jira, Asana) și facturare separate, fără integrare cu resursele sau contabilitatea' },
      { score: 4, text: 'Project management, timetracking și facturare parțial integrate; metrici de performanță monitorizați' },
    ],
  },
  'Construcții': {
    question: 'Cum sunt gestionate devizele, proiectele de construcție, aprovizionarea cu materiale și subcontractorii?',
    options: [
      { score: 1, text: 'Devizele și urmărirea lucrărilor se fac manual sau pe hârtie, fără software dedicat construcțiilor' },
      { score: 2, text: 'Devize în Excel; urmărirea costurilor și materialelor este parțială, des inexactă sau cu întârzieri' },
      { score: 3, text: 'Software de devize sau gestiune șantier, neintegrat cu contabilitatea sau furnizorii' },
      { score: 4, text: 'Devize, urmărire lucrări și aprovizionare parțial integrate; raportare pe proiecte disponibilă' },
    ],
  },
  'Non-profit & ONG': {
    question: 'Cum sunt gestionate activitățile, baza de donatori/beneficiari, granturile primite și raportările obligatorii?',
    options: [
      { score: 1, text: 'Activitățile și finanțele sunt urmărite manual sau în documente nestructurate, fără sistem informatic' },
      { score: 2, text: 'Baza de donatori și cheltuielile în Excel; raportările se fac manual, cu efort mare și risc de erori' },
      { score: 3, text: 'Software de contabilitate sau facturare utilizat; evidența donatorilor sau proiectelor parțial informatizată' },
      { score: 4, text: 'Gestionarea granturilor, donatorilor și raportărilor este parțial automatizată; audit intern facilitat' },
    ],
  },
  default: {
    question: 'Care este starea actuală a proceselor interne ale companiei dumneavoastră?',
    options: [
      { score: 1, text: 'Procese complet manuale, fără documentație sau standarde definite' },
      { score: 2, text: 'Procese parțial documentate, gestionate prin Excel și registre pe hârtie' },
      { score: 3, text: 'Procese documentate, utilizăm câteva aplicații software dedicate' },
      { score: 4, text: 'Procese optimizate și standardizate, sisteme parțial integrate între ele' },
    ],
  },
};

// ------------------------------------------------------------
// Cele 7 dimensiuni ale auditului ERP
// Mapate pe cadrele TOE și TAM (Davis, 1989)
// Dimensiunile 6–7 sunt noi față de framework-urile clasice
// ------------------------------------------------------------
export const DIMENSIONS = [
  {
    id: 'procese',
    label: 'Procese Interne',
    description: 'Maturitatea proceselor de business (specifice industriei)',
    icon: '⚙️',
    toeContext: 'TOE - Context Organizațional',
    // Întrebarea și opțiunile se preiau din PROCESS_QUESTIONS în AuditStep
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
    toeContext: 'TOE - Context Organizațional',
    question: 'Cum descrieți situația financiară a companiei în raport cu proiectul ERP?',
    options: [
      { score: 1, text: 'Vrem să implementăm ERP, dar nu avem buget aprobat sau alocat momentan' },
      { score: 2, text: 'Buget limitat; explorăm granturi, finanțare externă sau soluții open-source gratuite' },
      { score: 3, text: 'Buget parțial alocat intern, cu posibilitate de suplimentare dacă este nevoie' },
      { score: 4, text: 'Buget clar definit, aprobat de management și disponibil imediat' },
    ],
  },
  {
    id: 'it',
    label: 'Capacitate IT',
    description: 'Infrastructura tehnică și expertiza internă IT',
    icon: '💻',
    toeContext: 'TOE - Context Tehnologic',
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
    description: 'Atitudinea față de schimbare și adopție (TAM - utilitate percepută)',
    icon: '👥',
    toeContext: 'TOE + TAM - Utilitate percepută / Ușurință de utilizare',
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
    toeContext: 'TOE - Context de Mediu',
    question: 'Cum gestionați în prezent conformitatea legislativă și raportările obligatorii?',
    options: [
      { score: 1, text: 'Conformitate minimă, avem probleme frecvente cu autoritățile fiscale' },
      { score: 2, text: 'Conformitate parțială, unele raportări se fac cu întârzieri sau erori' },
      { score: 3, text: 'Conformitate bună, documentația este în regulă și raportările sunt la timp' },
      { score: 4, text: 'Conformitate exemplară, suntem pregătiți oricând pentru un audit extern' },
    ],
  },
  {
    id: 'securitate',
    label: 'Securitate & Date',
    description: 'Politici de securitate, protecția datelor și conformitate GDPR',
    icon: '🔒',
    toeContext: 'TOE - Context Tehnologic',
    question: 'Cum gestionați securitatea datelor și accesul la informațiile companiei?',
    options: [
      { score: 1, text: 'Nu avem politici de securitate; datele sunt accesate fără restricții și nu există backup regulat' },
      { score: 2, text: 'Parole simple pe calculatoare; backup ocazional fără proceduri; nu avem o politică GDPR documentată' },
      { score: 3, text: 'Control acces per utilizator; backup automatizat; antivirus activ; cerințe GDPR de bază acoperite' },
      { score: 4, text: 'Politici documentate (GDPR/ISO 27001); criptare date sensibile; backup testat; plan de recuperare dezastre' },
    ],
  },
  {
    id: 'infrastructura_date',
    label: 'Infrastructură Date',
    description: 'Tipul de baze de date utilizate și maturitatea infrastructurii de date',
    icon: '🗄️',
    toeContext: 'TOE - Context Tehnologic',
    question: 'Ce infrastructură de date utilizează compania în prezent?',
    options: [
      { score: 1, text: 'Nu folosim nicio bază de date structurată; datele sunt stocate în Excel sau pe hârtie' },
      { score: 2, text: 'Software cu baze de date locale (Access, Firebird); arhitectură fișier-server fără acces concurent' },
      { score: 3, text: 'Server de baze de date dedicat, gestionat intern (SQL Server, MySQL, PostgreSQL)' },
      { score: 4, text: 'Baze de date cloud sau enterprise gestionate profesional (Oracle, Azure SQL, AWS RDS)' },
    ],
  },
  {
    id: 'aplicatii_sw',
    label: 'Aplicații Software',
    description: 'Gradul de acoperire a proceselor cu aplicații software dedicate',
    icon: '💾',
    toeContext: 'TOE - Context Tehnologic & Organizațional',
    question: 'Cum sunt acoperite procesele de business cu aplicații software dedicate?',
    options: [
      { score: 1, text: 'Nu folosim aplicații software dedicate; procesele sunt manuale sau gestionate în Excel' },
      { score: 2, text: 'Unul sau două softuri izolate (ex. contabilitate sau facturare), fără integrare între ele' },
      { score: 3, text: 'Mai multe aplicații specializate pentru procese cheie (CRM, stocuri, HR), parțial conectate' },
      { score: 4, text: 'Suite software integrată sau aplicații bine conectate, cu flux de date automatizat între module' },
    ],
  },
  {
    id: 'prezenta_online',
    label: 'Prezență Online',
    description: 'Nivelul de prezență digitală și interacțiune online cu clienții',
    icon: '🌐',
    toeContext: 'TOE - Context de Mediu (E-commerce)',
    question: 'Care este nivelul de prezență online și de interacțiune digitală cu clienții?',
    options: [
      { score: 1, text: 'Nu avem website sau prezență online activă' },
      { score: 2, text: 'Site static de prezentare (informații de contact, despre companie)' },
      { score: 3, text: 'Site activ cu conținut actualizat, catalog de produse sau servicii descrise online' },
      { score: 4, text: 'E-commerce funcțional sau portal clienți cu funcționalitate completă (comenzi, cont, rapoarte)' },
    ],
  },
  {
    id: 'colaborare',
    label: 'Colaborare & Groupware',
    description: 'Uneltele de colaborare și partajare a informațiilor în echipă',
    icon: '🤝',
    toeContext: 'TOE - Context Organizațional (Groupware)',
    question: 'Cum colaborează echipa intern și cum sunt partajate informațiile în companie?',
    options: [
      { score: 1, text: 'Comunicare față în față și telefon; nu există unelte digitale comune de colaborare' },
      { score: 2, text: 'Email și foldere partajate local (USB, Dropbox, rețea internă); fără colaborare în timp real' },
      { score: 3, text: 'Google Workspace sau Microsoft 365; documente partajate, videoconferințe, calendar comun; sau unelte de management proiecte (Jira, Trello)' },
      { score: 4, text: 'Platformă integrată de colaborare (Teams, Slack, Jira); fluxuri de lucru automatizate și notificări în timp real' },
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
// Formula: suma_răspunsuri / (nr_dimensiuni_completate × 4) × 100
// Cu 7 dimensiuni complete: max = 7×4 = 28
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
// Cele 4 sisteme ERP comparate - focus IMM România & Moldova
// ------------------------------------------------------------
const ERP_SYSTEMS = [
  {
    id: 'winmentor',
    name: 'WinMentor',
    vendor: 'WinMentor SRL',
    logo: '🏭',
    country: 'RO',
    description: 'Soluție ERP lider în România, ideală pentru IMM-uri din producție și comerț. Integrare nativă cu legislația fiscală românească (SAF-T, RO e-Factura, ANAF). Motor BD: PostgreSQL 16 sau Oracle 19c (WinMentor Enterprise).',
    pros: ['Suport dedicat în limba română', 'Integrare nativă cu ANAF, SAF-T și RO e-Factura', 'Implementare rapidă (2–4 luni)', 'Preț competitiv pentru piața locală'],
    cons: ['Disponibil exclusiv în România', 'Funcționalități de BI limitate față de soluții internaționale'],
    budgetRange: ['sub5k', '5-15k', '15-40k', 'peste40k'],
    minITScore: 1,
    industries: ['Producție', 'Comerț & Distribuție', 'Construcții'],
  },
  {
    id: 'unasoft',
    name: 'UNA.md',
    vendor: 'Unisim-Soft SRL',
    logo: '🇲🇩',
    country: 'both',
    description: 'Soluție ERP disponibilă în Moldova și România, optimizată pentru legislația moldovenească dar funcțională și pe piața românească. Motor BD: Oracle Standard Edition One (licență incorporată la ~50% din prețul standard, exclusiv pentru sistemul UNA).',
    pros: ['Disponibil în Moldova și România', 'Conformitate cu legislația Republicii Moldova', 'Suport în română și rusă', 'Preț accesibil pentru IMM-uri', 'Acces web și mobil (UNA Cloud)'],
    cons: ['Optimizat prioritar pentru piața moldovenească', 'Comunitate de utilizatori mai mică față de soluțiile internaționale', 'Integrări terțe mai limitate'],
    budgetRange: ['sub5k', '5-15k', '15-40k', 'peste40k'],
    minITScore: 2,
    industries: ['Producție', 'Comerț & Distribuție', 'Servicii'],
  },
  {
    id: 'saga',
    name: 'Saga Software',
    vendor: 'Saga Software SRL',
    logo: '📊',
    country: 'RO',
    description: 'Soluție accesibilă pentru firme mici, cu focus pe contabilitate, gestiune stocuri și facturare. Motor BD: Firebird 3.0 (arhitectură client-server din sept. 2024).',
    pros: ['Cel mai accesibil preț din piață', 'Ușor de utilizat, training minim necesar', 'Suport tehnic rapid', 'Potrivit pentru firme cu 1–30 angajați'],
    cons: ['Funcționalități limitate pentru producție complexă', 'Scalabilitate redusă la creșterea companiei', 'Fără module avansate de HR sau proiecte'],
    budgetRange: ['sub5k', '5-15k'],
    minITScore: 1,
    industries: ['Servicii', 'Comerț & Distribuție', 'Non-profit & ONG'],
  },
  {
    id: 'odoo',
    name: 'Odoo Community',
    vendor: 'Odoo SA (Open Source)',
    logo: '🌐',
    country: 'both',
    description: 'ERP open-source modular cu cel mai mare ecosistem de module și integrări. Folosește exclusiv PostgreSQL 13+. Gratuit, dar necesită expertiză IT pentru implementare și configurare.',
    pros: ['100% gratuit (versiunea Community)', 'Extrem de modular - plătești doar ce folosești', 'Comunitate globală vastă cu suport activ', 'Integrări native cu 1000+ aplicații', 'Scalabil de la 5 la 500+ angajați'],
    cons: ['Necesită expertiză IT solidă pentru implementare', 'Costurile de implementare pot depăși licența soluțiilor comerciale', 'Suport oficial contra cost (Odoo Enterprise)'],
    budgetRange: ['5-15k', '15-40k', 'peste40k'],
    minITScore: 2,
    industries: ['Producție', 'Comerț & Distribuție', 'Servicii', 'IT & Tehnologie', 'Construcții', 'Non-profit & ONG'],
  },
];

// ------------------------------------------------------------
// Calculare scor de compatibilitate pentru fiecare sistem ERP
// Returnează lista sortată descrescător după compatibilitate
// ------------------------------------------------------------
export const calculateERPCompatibility = (profile, scores) => {
  const totalScore       = calculateTotalScore(scores);
  const itScore          = scores.it                || 0;
  const bdScore          = scores.infrastructura_date || 0;
  const swScore          = scores.aplicatii_sw      || 0;
  const onlineScore      = scores.prezenta_online   || 0;

  const { buget, tara } = profile;
  const industrieCategorie = profile.industrie_categorie || profile.industrie || '';
  const nrAngajati         = profile.nr_angajati || 1;

  return ERP_SYSTEMS.map((erp) => {
    let compat = 25; // Bază neutră - valoare mică pentru a permite diferențiere reală la vârf

    // Factor 1: Compatibilitate geografică (25 pts max)
    if (erp.country === tara)        compat += 25;
    else if (erp.country === 'both') compat += 12;
    else                             compat -= 15;

    // Factor 2: Buget (20 pts max)
    if (erp.budgetRange.includes(buget)) compat += 20;
    else                                  compat -= 10;

    // Factor 3: Capacitate IT (15 pts max)
    // itScore=0 înseamnă necompletat → neutru, nu penalizăm
    if (itScore > 0) {
      if (itScore >= erp.minITScore + 1)       compat += 15;
      else if (itScore === erp.minITScore)      compat += 5;
      else if (erp.minITScore >= 2 && itScore < erp.minITScore) compat -= 15;
    }

    // Factor 4: Industrie (10 pts max)
    if (erp.industries.includes(industrieCategorie)) compat += 10;

    // Factor 5: Scor total - Odoo necesită pregătire mai bună, WinMentor penalizat la pregătire slabă
    // Prag 67% = corespunde cu scor 3 (din 4) pe toate dimensiunile, aliniat cu legenda UI
    if (erp.id === 'odoo'      && totalScore >= 67) compat += 12;
    if (erp.id === 'odoo'      && totalScore < 45)  compat -= 18;
    if (erp.id === 'winmentor' && totalScore < 45)  compat -= 8;

    // Factor 6: WinMentor favorizat pentru producție/comerț România
    if (erp.id === 'winmentor' && tara === 'RO' &&
        ['Producție', 'Comerț & Distribuție'].includes(industrieCategorie)) compat += 10;

    // Factor 7: Saga pentru bugete mici și companii mici
    if (erp.id === 'saga' && buget === 'sub5k') compat += 8;

    // Factor dimensiune companie - diferențiator cheie Saga vs WinMentor
    // Saga e conceput pentru firme mici (1–30 angajați)
    if (erp.id === 'saga') {
      if (nrAngajati <= 10)  compat += 12; // ideal pentru micro
      else if (nrAngajati <= 30) compat += 5;  // acceptabil pentru mici
      else if (nrAngajati <= 50) compat -= 8;  // prea mic pentru firme medii
      else                       compat -= 18; // inadecvat
    }
    // WinMentor - prea complex pentru micro, optim pentru 11–250
    if (erp.id === 'winmentor') {
      if (nrAngajati <= 5)       compat -= 8;  // overkill pentru micro-întreprinderi
      else if (nrAngajati <= 10) compat -= 3;
      else if (nrAngajati >= 11) compat += 8;  // zona ideală
    }
    // UNA.md - optim pentru 10–200 angajați
    if (erp.id === 'unasoft') {
      if (nrAngajati <= 5)         compat -= 5;  // subdimensionat pentru micro
      else if (nrAngajati <= 200)  compat += 8;  // zona ideală IMM
      else                         compat -= 5;  // UNA Enterprise necesită configurare suplimentară
    }
    // Odoo - scalabil, neutru pe dimensiune dar mai bun pentru firme medii
    if (erp.id === 'odoo' && nrAngajati >= 20) compat += 5;

    // Factor 9: Industrie IT - Odoo mai potrivit, WinMentor mai puțin
    if (erp.id === 'odoo'      && industrieCategorie === 'IT & Tehnologie') compat += 8;
    if (erp.id === 'winmentor' && industrieCategorie === 'IT & Tehnologie') compat -= 5;

    // Factor 10: Non-profit - Saga și Odoo mai adecvate
    if ((erp.id === 'saga' || erp.id === 'odoo') &&
        industrieCategorie === 'Non-profit & ONG') compat += 5;

    // Factor UNA special: optimizat pentru MD, disponibil și în RO dar secundar față de WinMentor
    if (erp.id === 'unasoft' && tara === 'MD') compat += 13; // bonus suplimentar piață principală
    if (erp.id === 'unasoft' && tara === 'RO') compat -= 8;  // dezavantaj față de WinMentor în RO

    // Factor 11: Infrastructură BD - doar dacă e completat (bdScore > 0)
    if (bdScore > 0) {
      if (erp.id === 'odoo'      && bdScore >= 3) compat += 7;
      if (erp.id === 'odoo'      && bdScore <= 1) compat -= 5;
      if (erp.id === 'saga'      && bdScore <= 2) compat += 4;
      if (erp.id === 'unasoft'   && bdScore >= 3) compat += 4;
      if (erp.id === 'winmentor' && bdScore >= 3) compat += 4; // PostgreSQL/Oracle nativ
    }

    // Factor 12: Aplicații software - doar dacă e completat (swScore > 0)
    if (swScore > 0) {
      if (erp.id === 'odoo' && swScore >= 3) compat += 6;
      if (erp.id === 'odoo' && swScore <= 1) compat -= 6;
      if (erp.id === 'saga' && swScore <= 2) compat += 5;
    }

    // Factor 13: Prezență online - e-commerce / portal → Odoo (modul nativ)
    if (erp.id === 'odoo'      && onlineScore >= 4) compat += 10;
    if (erp.id === 'odoo'      && onlineScore >= 3) compat += 5;
    if (erp.id === 'saga'      && onlineScore >= 4) compat -= 5;
    if (erp.id === 'winmentor' && onlineScore >= 4) compat -= 5;  // fără modul e-commerce nativ
    if (erp.id === 'unasoft'   && onlineScore >= 3) compat += 3;  // UNA Cloud - acces web/mobil

    // --------------------------------------------------------
    // Factori per-dimensiune pentru contorul live în timp real
    // Fiecare dimensiune contribuie diferit per ERP:
    // scor 1 = penalizare, 2 = neutru, 3 = bonus mic, 4 = bonus mare
    // --------------------------------------------------------
    const dimContrib = (score, low, high) => {
      if (!score || score === 0) return 0;
      if (score === 1) return low;
      if (score === 2) return Math.round(low / 2);
      if (score === 3) return Math.round(high / 2);
      return high;
    };

    const procese    = scores.procese    || 0;
    const financiar  = scores.financiar  || 0;
    const echipa     = scores.echipa     || 0;
    const conformitate = scores.conformitate || 0;
    const securitate = scores.securitate || 0;
    const colaborare = scores.colaborare || 0;

    if (erp.id === 'winmentor') {
      compat += dimContrib(procese,     -5, +7);  // WinMentor - ERP de producție, necesită procese mature
      compat += dimContrib(financiar,   -5, +7);  // Modul contabil complet, ROI clar la financiar mare
      compat += dimContrib(echipa,      -4, +5);  // Necesită super-user dedicat
      compat += dimContrib(conformitate,-4, +6);  // SAF-T/ANAF nativ - bonus dacă firma e conformă
      compat += dimContrib(securitate,  -2, +3);  // Securitate on-premise, cerințe moderate
      compat += dimContrib(colaborare,  -1, +2);  // Nu e punctul forte al WinMentor
    }
    if (erp.id === 'saga') {
      compat += dimContrib(procese,     -2, +3);  // Saga e simplu, nu necesită procese complexe
      compat += dimContrib(financiar,   -3, +6);  // Core-ul Saga e contabilitatea și facturarea
      compat += dimContrib(echipa,      -2, +3);  // Ușor de adoptat, training minim
      compat += dimContrib(conformitate,-3, +5);  // Suport basic SAF-T/e-Factura
      compat += dimContrib(securitate,  -1, +2);  // Cerințe minime de securitate
      compat += dimContrib(colaborare,  -1, +1);  // Fără module de colaborare
    }
    if (erp.id === 'unasoft') {
      compat += dimContrib(procese,     -4, +6);  // UNA necesită procese documentate
      compat += dimContrib(financiar,   -4, +7);  // Modul financiar-contabil principal
      compat += dimContrib(echipa,      -3, +4);  // Training moderat necesar
      compat += dimContrib(conformitate,-4, +6);  // Conformitate MD/RO - avantaj real la scor mare
      compat += dimContrib(securitate,  -2, +3);  // Oracle SE - securitate robustă la scor mare
      compat += dimContrib(colaborare,  -2, +3);  // Module colaborare disponibile
    }
    if (erp.id === 'odoo') {
      compat += dimContrib(procese,     -5, +8);  // Odoo modular - necesită procese definite
      compat += dimContrib(financiar,   -3, +5);  // Modul financiar disponibil dar nu e esențial
      compat += dimContrib(echipa,      -6, +8);  // Odoo complex - echipă tehnică puternică = mare diferență
      compat += dimContrib(conformitate,-5, +4);  // Module comunitate pt conformitate, mai puțin stabil
      compat += dimContrib(securitate,  -5, +6);  // Web-based - securitate critică
      compat += dimContrib(colaborare,  -3, +8);  // CRM, project, chat - Odoo excelează la colaborare
    }

    compat = Math.max(0, Math.min(100, compat));
    return { ...erp, compatibility: Math.round(compat) };
  }).sort((a, b) => {
    // Sortare primară: scor compatibilitate descrescător
    if (b.compatibility !== a.compatibility) return b.compatibility - a.compatibility;
    // Tiebreaker 1: potrivire industrie
    const aInd = a.industries.includes(industrieCategorie) ? 1 : 0;
    const bInd = b.industries.includes(industrieCategorie) ? 1 : 0;
    if (bInd !== aInd) return bInd - aInd;
    // Tiebreaker 2: potrivire buget
    const aBuget = a.budgetRange.includes(buget) ? 1 : 0;
    const bBuget = b.budgetRange.includes(buget) ? 1 : 0;
    if (bBuget !== aBuget) return bBuget - aBuget;
    // Tiebreaker 3: preferință geografică specifică
    if (tara === 'RO' && a.id === 'winmentor') return -1;
    if (tara === 'RO' && b.id === 'winmentor') return 1;
    if (tara === 'MD' && a.id === 'unasoft')   return -1;
    if (tara === 'MD' && b.id === 'unasoft')   return 1;
    return 0;
  });
};

// ------------------------------------------------------------
// Recomandare metodologie de implementare bazată pe scorul total
// Agile ≥67%, Hibridă 45–66%, Waterfall <45%
// ------------------------------------------------------------
export const getMethodology = (totalScore) => {
  if (totalScore >= 75) {
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
          title: 'Sprint 0 - Configurare & Setup',
          duration: '2 săptămâni',
          desc: 'Configurarea mediului tehnic, instalarea ERP, definirea modulelor prioritare, training pentru echipa cheie.',
        },
        {
          step: 2,
          title: 'Sprinturi 1–N - Implementare Iterativă',
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
  return map[buget] || buget || '-';
};
