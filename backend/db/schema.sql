-- ============================================================
-- Schema bazei de date pentru ERP Advisor
-- Tabel pentru stocarea anonimă a rezultatelor auditului ERP
-- Folosit pentru calculul benchmark-ului comparativ
-- ============================================================

CREATE TABLE IF NOT EXISTS audit_results (
  id                  INTEGER PRIMARY KEY AUTOINCREMENT,

  -- Profilul companiei (anonim, fără date de identificare)
  tara                TEXT    NOT NULL,  -- 'RO' sau 'MD'
  industrie           TEXT    NOT NULL,  -- Producție, Comerț, Servicii, etc.
  nr_angajati         INTEGER NOT NULL DEFAULT 0,
  buget               TEXT    NOT NULL,  -- sub5k, 5-15k, 15-40k, peste40k

  -- Scorurile brute pe cele 5 dimensiuni (1–4)
  scor_procese        INTEGER NOT NULL,
  scor_financiar      INTEGER NOT NULL,
  scor_it             INTEGER NOT NULL,
  scor_echipa         INTEGER NOT NULL,
  scor_conformitate   INTEGER NOT NULL,

  -- Scorul total procentual (0–100)
  scor_total          INTEGER NOT NULL,

  -- ERP-ul recomandat după calcul
  erp_recomandat      TEXT    NOT NULL DEFAULT 'Necunoscut',

  -- Marca temporală (UTC)
  creat_la            DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Index pentru filtrare rapidă după țară și industrie (folosit la benchmark)
CREATE INDEX IF NOT EXISTS idx_tara_industrie
  ON audit_results(tara, industrie);

-- Index pentru sortare după scor total
CREATE INDEX IF NOT EXISTS idx_scor_total
  ON audit_results(scor_total);
