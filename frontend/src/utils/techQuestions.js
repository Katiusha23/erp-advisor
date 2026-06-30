export const TECH_QUESTIONS = [
  {
    id: 'os_tip',
    label: 'Sistem de operare predominant',
    icon: '💻',
    section: 'tech',
    question: 'Ce sistem de operare folosesc stațiile de lucru din compania dumneavoastră?',
    options: [
      { score: 1, text: 'Windows 10' },
      { score: 2, text: 'Windows 11' },
      { score: 2, text: 'Windows Server 2016 / 2019 / 2022' },
      { score: 3, text: 'macOS' },
      { score: 2, text: 'Linux (Ubuntu, CentOS, Debian etc.)' },
      { score: 1, text: 'Infrastructură mixtă (Windows + Mac/Linux)' },
    ],
  },
  {
    id: 'retea_tip',
    label: 'Tipul rețelei interne',
    icon: '🌐',
    section: 'tech',
    question: 'Cum este organizată rețeaua internă a companiei?',
    options: [
      { score: 1, text: 'Workgroup (fără server central)' },
      { score: 3, text: 'Domeniu Windows cu Active Directory / LDAP' },
      { score: 4, text: 'Cloud (Azure AD / Google Workspace)' },
      { score: 3, text: 'Hibrid (on-premises + cloud)' },
    ],
  },
  {
    id: 'admin_retea',
    label: 'Administrarea rețelei',
    icon: '🛠️',
    section: 'tech',
    question: 'Cine administrează infrastructura IT și rețeaua companiei?',
    options: [
      { score: 4, text: 'Departament IT intern dedicat' },
      { score: 3, text: 'Firmă IT externalizată' },
      { score: 2, text: 'Parțial intern, parțial externalizat' },
      { score: 1, text: 'Fără administrator dedicat' },
    ],
  },
  {
    id: 'securitate_retea',
    label: 'Politici de securitate',
    icon: '🔒',
    section: 'tech',
    question: 'Ce politici de securitate sunt implementate în rețeaua companiei?',
    options: [
      { score: 1, text: 'Antivirus și firewall de bază' },
      { score: 2, text: 'Group Policy (GPO) configurate' },
      { score: 3, text: 'SIEM, MFA și GPO implementate' },
      { score: 4, text: 'Certificare ISO 27001' },
    ],
  },
  {
    id: 'firewall',
    label: 'Infrastructură firewall',
    icon: '🧱',
    section: 'tech',
    question: 'Ce tip de firewall / protecție de rețea utilizați?',
    options: [
      { score: 1, text: 'Router ISP cu firewall integrat' },
      { score: 2, text: 'Firewall hardware dedicat (Cisco, Fortinet, Sophos etc.)' },
      { score: 3, text: 'UTM / Next-Gen Firewall cu IPS, DPI și VPN' },
      { score: 4, text: 'Cloud firewall / SD-WAN (Palo Alto, Zscaler etc.)' },
    ],
  },
];

export function calcTechCompatibility(techScores, erpName) {
  let score = 100;
  const notes = [];

  const os  = techScores.os_tip;
  const net = techScores.retea_tip;
  const fw  = techScores.firewall;
  const sec = techScores.securitate_retea;
  const adm = techScores.admin_retea;

  const OS_LINUX   = 'Linux (Ubuntu, CentOS, Debian etc.)';
  const OS_MIXT    = 'Infrastructură mixtă (Windows + Mac/Linux)';
  const OS_SERVER  = 'Windows Server 2016 / 2019 / 2022';
  const NET_WG     = 'Workgroup (fără server central)';
  const NET_CLOUD  = 'Cloud (Azure AD / Google Workspace)';
  const NET_HIBRID = 'Hibrid (on-premises + cloud)';
  const FW_CLOUD   = 'Cloud firewall / SD-WAN (Palo Alto, Zscaler etc.)';
  const FW_UTM     = 'UTM / Next-Gen Firewall cu IPS, DPI și VPN';
  const SEC_SIEM   = 'SIEM, MFA și GPO implementate';
  const ADM_IT     = 'Departament IT intern dedicat';
  const ADM_EXT    = 'Firmă IT externalizată';
  const ADM_NONE   = 'Fără administrator dedicat';

  if (erpName === 'WinMentor') {
    if (os === 'macOS')      { score -= 35; notes.push('WinMentor este exclusiv Windows - pe macOS necesită VM (Parallels, VMware Fusion)'); }
    if (os === OS_LINUX)     { score -= 30; notes.push('WinMentor nu rulează nativ pe Linux - necesită Windows sau VM'); }
    if (os === OS_MIXT)      { score -= 15; notes.push('Stațiile non-Windows necesită VM sau Remote Desktop pentru WinMentor'); }
    if (os === 'Windows 10') { score -= 5;  notes.push('Windows 10 suportat, dar Windows 11 sau Server recomandat'); }
    if (os === OS_SERVER)    { score += 5;  notes.push('Windows Server este mediul optim pentru WinMentor multi-user'); }
    if (net === NET_WG)      { score -= 10; notes.push('Workgroup funcționează, dar domeniu Windows recomandat pentru multi-user'); }
    if (adm === ADM_NONE)    { score -= 5;  notes.push('WinMentor necesită cel puțin suport IT de bază pentru instalare și mentenanță'); }
    if (adm === ADM_IT)      { score += 3;  notes.push('Departamentul IT intern facilitează implementarea și suportul WinMentor'); }
  }

  if (erpName === 'Saga') {
    if (os === 'macOS')      { score -= 30; notes.push('Saga nu are versiune nativă macOS - necesită VM (Parallels) sau Remote Desktop'); }
    if (os === OS_LINUX)     { score -= 25; notes.push('Saga rulează pe Windows; pe Linux necesită Wine sau VM'); }
    if (os === OS_MIXT)      { score -= 10; notes.push('Utilizatorii Mac/Linux necesită Remote Desktop sau VM pentru acces Saga'); }
    if (os === OS_SERVER)    { score += 2;  notes.push('Windows Server asigură stabilitate pentru Saga în rețea'); }
    if (net === NET_WG)      { score -= 5;  notes.push('Funcționează în workgroup, dar performanța pe rețea partajată e limitată'); }
    if (adm === ADM_NONE)    { score -= 2;  notes.push('Saga poate fi administrat cu cunoștințe IT minime, dar lipsa suportului crește riscul de erori'); }
  }

  if (erpName === 'UNA.md') {
    if (os === 'macOS')      { score -= 25; notes.push('UNA.md nu are client nativ macOS - acces prin Remote Desktop sau browser'); }
    if (os === OS_LINUX)     { score -= 20; notes.push('UNA.md preferă Windows Server; Linux suportat parțial'); }
    if (os === OS_MIXT)      { score -= 10; notes.push('Stațiile non-Windows pot accesa UNA prin modulul web, cu funcționalitate limitată'); }
    if (os === OS_SERVER)    { score += 3;  notes.push('Windows Server este mediul recomandat pentru serverul UNA.md'); }
    if (net === NET_WG)      { score -= 15; notes.push('Recomandă domeniu Windows pentru acces multi-utilizator stabil'); }
    if (adm === ADM_NONE)    { score -= 8;  notes.push('UNA.md cu Oracle necesită administrare IT pentru instalare, licențiere și backup'); }
    if (adm === ADM_IT)      { score += 4;  notes.push('Departament IT intern - ideal pentru administrarea bazei Oracle din UNA.md'); }
    if (adm === ADM_EXT)     { score += 2;  notes.push('Firma IT externalizată poate asigura suportul tehnic pentru UNA.md'); }
  }

  if (erpName === 'Odoo') {
    if (os === OS_LINUX || os === OS_MIXT) { score += 5;  notes.push('Odoo rulează nativ pe Linux - configurație ideală'); }
    if (os === 'macOS')                    { score += 3;  notes.push('Odoo se accesează din browser - macOS complet compatibil'); }
    if (os === 'Windows 10' || os === 'Windows 11') { score -= 5; notes.push('Odoo pe Windows necesită WSL sau Docker pentru server'); }
    if (os === OS_SERVER)                  { score -= 3;  notes.push('Odoo pe Windows Server necesită WSL2 sau Docker; Linux rămâne mediul preferat'); }
    if (net === NET_CLOUD || net === NET_HIBRID) { score += 5; notes.push('Arhitectura cloud-first a Odoo se potrivește perfect cu infrastructura ta'); }
    if (fw === FW_CLOUD   || fw === FW_UTM)     { score += 5; notes.push('Firewall avansat compatibil cu deployment cloud Odoo'); }
    if (adm === ADM_NONE)  { score -= 10; notes.push('Odoo necesită expertiză IT solidă pentru instalare, configurare module și mentenanță server'); }
    if (adm === ADM_IT)    { score += 7;  notes.push('Departament IT intern dedicat - condiție ideală pentru deployment și customizare Odoo'); }
    if (adm === ADM_EXT)   { score += 3;  notes.push('Firma IT externalizată poate gestiona serverul Odoo, dar timpul de răspuns poate fi limitat'); }
  }

  if (sec === 'Certificare ISO 27001' || sec === SEC_SIEM) {
    notes.push('Politicile de securitate avansate sunt compatibile cu toate sistemele ERP analizate');
  }

  return { score: Math.min(100, Math.max(0, score)), notes };
}
