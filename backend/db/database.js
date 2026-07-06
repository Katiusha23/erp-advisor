// ============================================================
// Modul de conectare la baza de date SQLite
// Folosește sql.js (WASM pur) — fără compilare nativă
// Baza de date se păstrează în memorie + salvare pe disc la fiecare scriere
// ============================================================

const initSqlJs = require('sql.js');
const path      = require('path');
const fs        = require('fs');

const DB_PATH = path.resolve(
  process.env.DATABASE_URL || path.join(__dirname, 'erp_advisor.db'),
);

let db; // Instanța SQLite în memorie

// Salvează baza de date pe disc după fiecare scriere
const persistToFile = () => {
  const data   = db.export();
  const buffer = Buffer.from(data);
  const dir    = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(DB_PATH, buffer);
};

// ============================================================
// Inițializare: încarcă sau creează fișierul SQLite
// ============================================================
const initDatabase = async () => {
  const SQL = await initSqlJs();
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  if (fs.existsSync(DB_PATH)) {
    // Încarcă baza de date existentă
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
  } else {
    // Creare bază de date nouă
    db = new SQL.Database();
  }

  // Executare schemă SQL (CREATE TABLE IF NOT EXISTS)
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  db.run(schema);

  // Migrare: adaugă coloanele noi dacă nu există (ALTER TABLE ignorat dacă există deja)
  const migrations = [
    `ALTER TABLE audit_results ADD COLUMN industrie_subcategorie TEXT NOT NULL DEFAULT ''`,
    `ALTER TABLE audit_results ADD COLUMN scor_securitate INTEGER NOT NULL DEFAULT 0`,
    `ALTER TABLE audit_results ADD COLUMN scor_digital INTEGER NOT NULL DEFAULT 0`,
    `ALTER TABLE audit_results ADD COLUMN scor_colaborare INTEGER NOT NULL DEFAULT 0`,
    `ALTER TABLE audit_results ADD COLUMN scor_infrastructura_date INTEGER NOT NULL DEFAULT 0`,
    `ALTER TABLE audit_results ADD COLUMN scor_aplicatii_sw INTEGER NOT NULL DEFAULT 0`,
    `ALTER TABLE audit_results ADD COLUMN scor_prezenta_online INTEGER NOT NULL DEFAULT 0`,
  ];
  for (const sql of migrations) {
    try { db.run(sql); } catch (_) { /* coloana există deja */ }
  }

  persistToFile();
  console.log('✅ Baza de date inițializată:', DB_PATH);

  // Seed automat dacă baza e goală
  const count = db.exec('SELECT COUNT(*) as cnt FROM audit_results')[0]?.values?.[0]?.[0] || 0;
  if (count === 0) {
    console.log('📦 Baza de date goală — adăugare date seed...');
    const seedData = [
      // România - Producție
      ['RO','Producție','Alimentară & Băuturi',45,'15-40k',3,3,2,3,3,2,2,2,2,2,63,'WinMentor'],
      ['RO','Producție','Automotive & Piese Auto',120,'15-40k',4,4,3,3,4,3,3,3,2,3,80,'WinMentor'],
      ['RO','Producție','Textile & Îmbrăcăminte',30,'5-15k',2,2,1,2,2,1,1,2,2,1,40,'Saga Software'],
      ['RO','Producție','Mobilă & Prelucrarea Lemnului',60,'15-40k',3,3,2,2,3,2,2,2,2,2,58,'WinMentor'],
      ['RO','Producție','Altă producție industrială',200,'peste40k',4,4,4,4,4,4,4,4,3,4,98,'WinMentor'],
      // România - Comerț & Distribuție
      ['RO','Comerț & Distribuție','Retail alimentar (FMCG)',25,'5-15k',2,2,1,2,2,1,1,2,3,2,45,'Saga Software'],
      ['RO','Comerț & Distribuție','Distribuție en-gros',70,'15-40k',3,3,1,3,3,2,2,2,3,2,60,'WinMentor'],
      ['RO','Comerț & Distribuție','E-commerce & Online',15,'5-15k',3,2,2,3,2,2,2,3,4,3,65,'Odoo Community'],
      ['RO','Comerț & Distribuție','Import-export',40,'15-40k',3,3,2,3,3,2,2,3,3,2,65,'WinMentor'],
      ['RO','Comerț & Distribuție','Retail non-alimentar',8,'sub5k',1,2,1,1,2,1,1,1,2,1,33,'Saga Software'],
      // România - Servicii
      ['RO','Servicii','Servicii profesionale (consultanță, juridic, contabilitate)',12,'5-15k',3,3,2,3,3,2,2,3,2,3,65,'Odoo Community'],
      ['RO','Servicii','Transport & Logistică',55,'15-40k',3,3,2,3,3,2,2,2,2,2,60,'WinMentor'],
      ['RO','Servicii','HoReCa (hotel, restaurant, cafenea)',20,'5-15k',2,2,1,2,2,1,1,2,3,2,45,'Saga Software'],
      ['RO','Servicii','Educație & Training',35,'5-15k',2,3,2,3,2,2,2,2,3,3,60,'Odoo Community'],
      ['RO','Servicii','Media & Publicitate',18,'5-15k',3,2,3,3,2,3,3,3,4,4,75,'Odoo Community'],
      // România - IT & Tehnologie
      ['RO','IT & Tehnologie','Dezvoltare software & aplicații',25,'5-15k',4,3,4,4,3,4,4,4,4,4,95,'Odoo Community'],
      ['RO','IT & Tehnologie','Servicii IT & Outsourcing',40,'15-40k',3,3,3,4,3,3,3,3,3,4,83,'Odoo Community'],
      ['RO','IT & Tehnologie','Telecomunicații',80,'peste40k',4,4,4,4,4,4,4,4,3,4,98,'Odoo Community'],
      // România - Construcții
      ['RO','Construcții','Construcții civile & industriale',65,'15-40k',2,3,1,2,3,1,1,2,1,1,45,'WinMentor'],
      ['RO','Construcții','Real Estate & Imobiliare',30,'15-40k',3,3,2,3,3,2,2,3,3,2,65,'WinMentor'],
      // România - Non-profit
      ['RO','Non-profit & ONG','ONG & Asociații',10,'sub5k',2,1,1,2,2,1,1,1,2,2,38,'Saga Software'],
      ['RO','Non-profit & ONG','Fundații',15,'sub5k',2,2,1,2,3,1,1,2,2,2,45,'Saga Software'],
      // Moldova - diverse industrii
      ['MD','Producție','Alimentară & Băuturi',55,'15-40k',3,3,2,3,3,2,2,2,2,2,60,'UNA.md'],
      ['MD','Producție','Altă producție industrială',110,'15-40k',4,3,3,3,4,3,3,3,2,3,78,'UNA.md'],
      ['MD','Comerț & Distribuție','Distribuție en-gros',45,'15-40k',3,3,2,3,3,2,2,2,2,2,58,'UNA.md'],
      ['MD','Comerț & Distribuție','Retail alimentar (FMCG)',20,'5-15k',2,2,1,2,2,1,1,1,2,1,38,'UNA.md'],
      ['MD','Servicii','Servicii profesionale (consultanță, juridic, contabilitate)',18,'5-15k',3,3,2,3,3,2,2,2,3,3,65,'UNA.md'],
      ['MD','Servicii','Transport & Logistică',40,'15-40k',3,3,2,2,3,2,2,2,2,2,58,'UNA.md'],
      ['MD','IT & Tehnologie','Dezvoltare software & aplicații',22,'5-15k',4,3,4,4,3,4,3,4,4,4,93,'Odoo Community'],
      ['MD','Non-profit & ONG','ONG & Asociații',8,'sub5k',2,1,1,2,2,1,1,1,2,1,35,'UNA.md'],
    ];

    const insertSql = `INSERT INTO audit_results
      (tara, industrie, industrie_subcategorie, nr_angajati, buget,
       scor_procese, scor_financiar, scor_it, scor_echipa, scor_conformitate,
       scor_securitate, scor_infrastructura_date, scor_aplicatii_sw,
       scor_prezenta_online, scor_colaborare, scor_total, erp_recomandat)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;

    for (const row of seedData) {
      db.run(insertSql, row);
    }
    persistToFile();
    console.log(`✅ ${seedData.length} înregistrări seed adăugate.`);
  }

  return db;
};

const getDb = () => {
  if (!db) throw new Error('Baza de date nu este inițializată. Apelați initDatabase() mai întâi.');
  return db;
};

// Salvare explicită după operații de scriere
const saveDb = () => persistToFile();

// ============================================================
// Helpers pentru a imita API-ul better-sqlite3
// ============================================================

// Execută un INSERT/UPDATE/DELETE și returnează lastInsertRowid
const dbRun = (sql, params = []) => {
  getDb().run(sql, params);
  saveDb();
  const rowId = getDb().exec('SELECT last_insert_rowid() AS id')[0]?.values?.[0]?.[0];
  return { lastInsertRowid: rowId };
};

// Execută un SELECT și returnează primul rând ca obiect
const dbGet = (sql, params = []) => {
  const stmt = getDb().prepare(sql);
  stmt.bind(params);
  if (stmt.step()) {
    const cols = stmt.getColumnNames();
    const vals = stmt.get();
    stmt.free();
    return Object.fromEntries(cols.map((c, i) => [c, vals[i]]));
  }
  stmt.free();
  return null;
};

// Execută un SELECT și returnează toate rândurile ca array de obiecte
const dbAll = (sql, params = []) => {
  const stmt = getDb().prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) {
    const cols = stmt.getColumnNames();
    const vals = stmt.get();
    rows.push(Object.fromEntries(cols.map((c, i) => [c, vals[i]])));
  }
  stmt.free();
  return rows;
};

module.exports = { initDatabase, getDb, saveDb, dbRun, dbGet, dbAll };
