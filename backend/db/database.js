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
  persistToFile();

  console.log('✅ Baza de date inițializată:', DB_PATH);
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
