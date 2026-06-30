// ============================================================
// Rute API pentru benchmark-ul comparativ anonim
// Salvează rezultatele auditului și calculează statistici
// ============================================================

const express = require('express');
const router  = express.Router();
const { dbRun, dbGet } = require('../db/database');

// ------------------------------------------------------------
// POST /api/save-result
// Salvează anonim rezultatul unui audit în baza de date
// ------------------------------------------------------------
router.post('/save-result', (req, res) => {
  try {
    const {
      tara, industrie, industrie_subcategorie, nr_angajati, buget,
      scor_procese, scor_financiar, scor_it, scor_echipa, scor_conformitate,
      scor_securitate, scor_infrastructura_date, scor_aplicatii_sw,
      scor_prezenta_online, scor_colaborare,
      scor_total, erp_recomandat,
    } = req.body;

    if (!tara || !industrie || !buget || scor_total === undefined) {
      return res.status(400).json({ eroare: 'Câmpuri obligatorii lipsă: tara, industrie, buget, scor_total' });
    }

    const result = dbRun(
      `INSERT INTO audit_results
         (tara, industrie, industrie_subcategorie, nr_angajati, buget,
          scor_procese, scor_financiar, scor_it, scor_echipa, scor_conformitate,
          scor_securitate, scor_infrastructura_date, scor_aplicatii_sw,
          scor_prezenta_online, scor_colaborare,
          scor_total, erp_recomandat)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        tara,
        industrie,
        industrie_subcategorie || '',
        nr_angajati || 0,
        buget,
        scor_procese               || 0,
        scor_financiar             || 0,
        scor_it                    || 0,
        scor_echipa                || 0,
        scor_conformitate          || 0,
        scor_securitate            || 0,
        scor_infrastructura_date   || 0,
        scor_aplicatii_sw          || 0,
        scor_prezenta_online       || 0,
        scor_colaborare            || 0,
        scor_total,
        erp_recomandat || 'Necunoscut',
      ],
    );

    res.json({ succes: true, id: result.lastInsertRowid, mesaj: 'Rezultat salvat anonim' });
  } catch (error) {
    console.error('Eroare save-result:', error);
    res.status(500).json({ eroare: 'Nu s-a putut salva rezultatul' });
  }
});

// ------------------------------------------------------------
// GET /api/benchmark?country=RO&industry=Retail
// Returnează statistici agregate pentru filtrele date
// ------------------------------------------------------------
router.get('/benchmark', (req, res) => {
  try {
    const { country, industry } = req.query;

    const conds  = [];
    const params = [];
    if (country)  { conds.push('tara = ?');     params.push(country); }
    if (industry) { conds.push('industrie = ?'); params.push(industry); }
    const where = conds.length ? 'WHERE ' + conds.join(' AND ') : '';

    const stats = dbGet(
      `SELECT
         COUNT(*)                          AS total_companii,
         ROUND(AVG(scor_total), 1)         AS scor_mediu,
         ROUND(AVG(scor_procese), 2)       AS avg_procese,
         ROUND(AVG(scor_financiar), 2)     AS avg_financiar,
         ROUND(AVG(scor_it), 2)            AS avg_it,
         ROUND(AVG(scor_echipa), 2)        AS avg_echipa,
         ROUND(AVG(scor_conformitate), 2)  AS avg_conformitate,
         ROUND(AVG(scor_securitate), 2)           AS avg_securitate,
         ROUND(AVG(scor_infrastructura_date), 2)  AS avg_infrastructura_date,
         ROUND(AVG(scor_aplicatii_sw), 2)         AS avg_aplicatii_sw,
         ROUND(AVG(scor_prezenta_online), 2)      AS avg_prezenta_online,
         ROUND(AVG(scor_colaborare), 2)           AS avg_colaborare,
         MIN(scor_total)                   AS scor_minim,
         MAX(scor_total)                   AS scor_maxim
       FROM audit_results ${where}`,
      params,
    );

    res.json({ succes: true, filtru: { tara: country, industrie: industry }, statistici: stats });
  } catch (error) {
    console.error('Eroare benchmark:', error);
    res.status(500).json({ eroare: 'Nu s-au putut calcula statisticile' });
  }
});

// ------------------------------------------------------------
// GET /api/benchmark/percentile?country=RO&industry=Retail&score=72
// Calculează ce % de companii are un scor MAI MIC decât cel dat
// ------------------------------------------------------------
router.get('/benchmark/percentile', (req, res) => {
  try {
    const { country, industry, score } = req.query;

    if (score === undefined) {
      return res.status(400).json({ eroare: 'Parametrul score este obligatoriu' });
    }

    const conds      = [];
    const baseParams = [];
    if (country)  { conds.push('tara = ?');     baseParams.push(country); }
    if (industry) { conds.push('industrie = ?'); baseParams.push(industry); }
    const where = conds.length ? 'WHERE ' + conds.join(' AND ') : '';

    const totalRow = dbGet(
      `SELECT COUNT(*) AS cnt FROM audit_results ${where}`,
      baseParams,
    );

    const belowWhere = where ? where + ' AND scor_total < ?' : 'WHERE scor_total < ?';
    const belowRow = dbGet(
      `SELECT COUNT(*) AS cnt FROM audit_results ${belowWhere}`,
      [...baseParams, parseInt(score)],
    );

    const percentila = totalRow?.cnt > 0
      ? Math.round((belowRow.cnt / totalRow.cnt) * 100)
      : 50;

    res.json({
      succes: true,
      percentila,
      total_companii: totalRow?.cnt || 0,
      mesaj: `Compania ta e mai pregătită decât ${percentila}% din IMM-urile similare`,
    });
  } catch (error) {
    console.error('Eroare percentilă:', error);
    res.status(500).json({ eroare: 'Nu s-a putut calcula percentila' });
  }
});

module.exports = router;
