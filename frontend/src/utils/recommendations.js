// Recomandări specifice per dimensiune, bazate pe nivelul scorului
// low: 0-33%, medium: 34-66%, high: 67-100%

export const DIMENSION_RECOMMENDATIONS = {
  procese: {
    low: {
      title: 'Documentați procesele înainte de orice altceva',
      actions: [
        'Cartografiați fluxurile de lucru principale (As-Is) pe hârtie sau în diagrame simple',
        'Identificați cele mai repetitive sarcini manuale - acestea sunt primele candidate pentru automatizare',
        'Standardizați cel puțin 2-3 procese cheie înainte de implementarea ERP',
      ],
    },
    medium: {
      title: 'Optimizați și integrați aplicațiile existente',
      actions: [
        'Eliminați duplicarea datelor între Excel și aplicațiile software existente',
        'Definiți responsabilități clare per proces (cine introduce, cine validează, cine aprobă)',
        'Testați un pilot ERP pe un singur departament înainte de rollout complet',
      ],
    },
  },
  financiar: {
    low: {
      title: 'Alocați buget înainte de a demara orice evaluare ERP',
      actions: [
        'Identificați surse de finanțare: fonduri europene (POCU, POC), programe IMM, leasing software',
        'Calculați costul proceselor manuale actuale - de obicei depășește costul ERP-ului în 2-3 ani',
        'Obțineți aprobarea formală a managementului pentru bugetul ERP înainte de evaluări de oferte',
      ],
    },
    medium: {
      title: 'Planificați bugetul pe 3 ani, nu doar pe primul an',
      actions: [
        'Includeți în buget: licențe, implementare, training, mentenanță anuală și personalizări ulterioare',
        'Rezervați 15-20% din buget pentru cheltuieli neprevăzute în implementare',
        'Evaluați opțiunile SaaS (abonament lunar) vs. on-premise (investiție inițială mare)',
      ],
    },
  },
  it: {
    low: {
      title: 'Consolidați infrastructura IT de bază înainte de ERP',
      actions: [
        'Angajați sau externalizați administrarea IT la o firmă specializată',
        'Instalați un server local sau migrați la cloud (Google Workspace / Microsoft 365)',
        'Asigurați o conexiune internet stabilă de minim 50 Mbps pentru toate stațiile de lucru',
      ],
    },
    medium: {
      title: 'Pregătiți echipa IT pentru cerințele ERP',
      actions: [
        'Trimiteți cel puțin o persoană la training de administrator pentru ERP-ul ales',
        'Documentați infrastructura actuală (servere, rețea, aplicații) - necesară în orice proiect ERP',
        'Evaluați dacă infrastructura actuală suportă numărul de utilizatori concurenți planificați',
      ],
    },
  },
  echipa: {
    low: {
      title: 'Gestionați rezistența la schimbare înainte de implementare',
      actions: [
        'Organizați sesiuni de informare cu toate departamentele - explicați beneficiile concrete, nu doar tehnologia',
        'Desemnați un "champion" ERP intern în fiecare departament cheie',
        'Implicați utilizatorii finali în selectarea ERP-ului - sentimentul de ownership reduce rezistența',
      ],
    },
    medium: {
      title: 'Structurați planul de training și adopție',
      actions: [
        'Elaborați un plan de training diferențiat: utilizatori simpli vs. administratori vs. management',
        'Planificați o perioadă de funcționare paralelă (sistem vechi + ERP nou) de minim 1-2 luni',
        'Definiți KPI-uri de adopție: procent utilizatori activi, tranzacții introduse în ERP vs. manual',
      ],
    },
  },
  conformitate: {
    low: {
      title: 'Rezolvați problemele de conformitate înainte de ERP',
      actions: [
        'Consultați un contabil autorizat pentru identificarea lacunelor fiscale curente',
        'Implementați raportarea SAF-T dacă sunteți contribuabil mare sau mijlociu în România',
        'Verificați dacă sunteți înrolat în sistemul RO e-Factura dacă efectuați tranzacții B2G',
      ],
    },
    medium: {
      title: 'Automatizați raportările obligatorii prin ERP',
      actions: [
        'Prioritizați în implementare modulele de contabilitate și raportare fiscală',
        'Verificați că ERP-ul ales are suport nativ pentru SAF-T și RO e-Factura (pentru România)',
        'Stabiliți un calendar intern de raportări și conectați-l la fluxurile din ERP',
      ],
    },
  },
  securitate: {
    low: {
      title: 'Implementați măsuri minime de securitate urgent',
      actions: [
        'Instalați antivirus centralizat și activați Windows Firewall pe toate stațiile',
        'Implementați backup automat zilnic al datelor - regula 3-2-1: 3 copii, 2 medii, 1 offsite',
        'Creați o politică minimă de parole (lungime, complexitate, expirare) și comunicați-o în scris',
      ],
    },
    medium: {
      title: 'Pregătiți infrastructura de securitate pentru ERP',
      actions: [
        'Implementați autentificare cu doi factori (MFA) pentru accesul la sistemele critice',
        'Documentați o politică GDPR: ce date colectați, cum le stocați, cum răspundeți la cereri de ștergere',
        'Segmentați rețeaua: serverul ERP nu ar trebui să fie pe același segment cu stațiile de lucru',
      ],
    },
  },
  infrastructura_date: {
    low: {
      title: 'Migrați de la Excel și hârtie la o bază de date structurată',
      actions: [
        'Centralizați datele din Excel în cel puțin o aplicație cu bază de date reală (chiar și Saga sau o soluție SaaS simplă)',
        'Curățați datele existente înainte de migrare - datele murdare în ERP = probleme garantate',
        'Evaluați dacă preferați on-premise (server local) sau cloud - costurile diferă semnificativ',
      ],
    },
    medium: {
      title: 'Pregătiți migrarea datelor istorice',
      actions: [
        'Inventariați toate sursele de date actuale: ce sisteme, ce formate, câți ani de istoric',
        'Identificați datele critice care trebuie migrate vs. cele care pot rămâne în arhivă',
        'Testați migrarea pe un set mic de date înainte de go-live',
      ],
    },
  },
  aplicatii_sw: {
    low: {
      title: 'Introduceți cel puțin o aplicație de gestiune înainte de ERP',
      actions: [
        'Adoptați o soluție simplă de facturare electronică (Smartbill, Oblio) ca prim pas de digitalizare',
        'Mapați toate aplicațiile software folosite în firmă - chiar și cele neoficiale sau personale',
        'ERP-ul va înlocui aceste aplicații - cunoașterea lor e esențială pentru planificarea migrării',
      ],
    },
    medium: {
      title: 'Planificați înlocuirea aplicațiilor existente cu modulele ERP',
      actions: [
        'Creați o hartă: aplicație actuală → modul ERP echivalent (ex: Smartbill → Modul Facturare Odoo)',
        'Identificați integrările necesare: aplicații care nu vor fi înlocuite și trebuie conectate la ERP',
        'Evaluați dacă datele din aplicațiile actuale pot fi exportate în formate standard (CSV, XML)',
      ],
    },
  },
  prezenta_online: {
    low: {
      title: 'Construiți o prezență online de bază',
      actions: [
        'Creați un website minim cu informații de contact, descriere servicii și locație',
        'Înregistrați-vă pe Google Business Profile - vizibilitate gratuită în căutări locale',
        'Un ERP cu modul e-commerce (ex. Odoo) va fi mult mai valoros dacă aveți deja prezență online',
      ],
    },
    medium: {
      title: 'Integrați canalele online cu ERP-ul',
      actions: [
        'Evaluați dacă ERP-ul ales are modul nativ de e-commerce sau API pentru integrare cu platforma actuală',
        'Sincronizarea stocuri website ↔ ERP este o cerință critică dacă vindeți online',
        'Colectați date despre clienții online într-un CRM - ERP-ul le poate centraliza cu toate celelalte date',
      ],
    },
  },
  colaborare: {
    low: {
      title: 'Adoptați unelte de colaborare înainte de ERP',
      actions: [
        'Migrați comunicarea internă pe email profesional (Google Workspace sau Microsoft 365 - de la 6€/user/lună)',
        'Folosiți Google Drive sau SharePoint pentru documente partajate - eliminați USB-urile și folderele locale',
        'ERP-ul va fi adoptat mult mai ușor dacă echipa e deja obișnuită cu unelte digitale colaborative',
      ],
    },
    medium: {
      title: 'Conectați platformele de colaborare cu ERP-ul',
      actions: [
        'Configurați notificări din ERP în canalele de comunicare (Teams, Slack) pentru aprobări și alerte',
        'Evaluați dacă ERP-ul ales are integrare nativă cu platforma de colaborare folosită',
        'Definiți fluxuri de aprobare digitale (ex: cerere achiziție → aprobare manager → comandă furnizor) în ERP',
      ],
    },
  },
};

// Termeni tehnici cu explicații pentru tooltips
export const TECH_TERMS = {
  'SAF-T': 'Standard Audit File for Tax - fișier XML standardizat prin care ANAF colectează datele contabile ale companiilor. Obligatoriu pentru marii contribuabili din România din 2022, extins progresiv.',
  'RO e-Factura': 'Sistemul național de facturare electronică din România, administrat de ANAF. Obligatoriu pentru tranzacțiile B2G (business-to-government) și în curs de extindere la B2B.',
  'GDPR': 'General Data Protection Regulation - regulamentul european privind protecția datelor personale, aplicabil în toate statele UE din 2018. Impune companiilor să protejeze datele clienților și angajaților.',
  'TOE': 'Technology-Organization-Environment - model teoretic (Tornatzky & Fleischer, 1990) care explică adopția tehnologiei prin trei factori: contextul tehnologic, organizațional și de mediu.',
  'TAM': 'Technology Acceptance Model - model teoretic (Davis, 1989) care explică acceptarea tehnologiei prin utilitatea percepută și ușurința de utilizare.',
  'TCO': 'Total Cost of Ownership - costul total al deținerii unui sistem, inclusiv achiziție, implementare, training, mentenanță și upgraduri pe durata întregului ciclu de viață.',
  'ROI': 'Return on Investment - rentabilitatea investiției, calculată ca (beneficii - costuri) / costuri × 100%.',
  'ERP': 'Enterprise Resource Planning - sistem informatic integrat care gestionează toate procesele de business ale unei companii: contabilitate, stocuri, producție, vânzări, HR etc.',
  'IMM': 'Întreprindere Mică și Mijlocie - companie cu mai puțin de 250 de angajați și cifră de afaceri anuală sub 50 milioane €, conform definiției UE.',
  'SaaS': 'Software as a Service - model de livrare software prin abonament lunar/anual, accesat prin browser, fără instalare locală. Opusul on-premise.',
  'PostgreSQL': 'Sistem de gestiune a bazelor de date relaționale open-source. Folosit de Odoo și WinMentor Enterprise ca motor principal de stocare.',
  'MFA': 'Multi-Factor Authentication - autentificare cu doi sau mai mulți factori (ex: parolă + cod SMS). Crește semnificativ securitatea accesului la sisteme.',
  'B2G': 'Business-to-Government - tranzacții comerciale între companii și instituții publice/guvernamentale.',
  'B2B': 'Business-to-Business - tranzacții comerciale între companii, spre deosebire de B2C (Business-to-Consumer).',
};
