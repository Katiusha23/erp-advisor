// ============================================================
// ERP Advisor — Server principal Node.js + Express
// Gestionează rutele API pentru generare PDF și benchmark
// ============================================================

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initDatabase } = require('./db/database');
const pdfRoutes = require('./routes/pdf');
const benchmarkRoutes = require('./routes/benchmark');
const emailRoutes = require('./routes/email');

const app = express();
const PORT = process.env.PORT || 3001;

// ============================================================
// Configurare CORS — permite requesturi din frontend-ul Vercel
// ============================================================
app.use(cors({
  origin: (origin, callback) => {
    // Permite: fără origin (curl/Postman), orice localhost, domenii Vercel, URL-ul din .env
    const isLocalhost = !origin || origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1');
    const isVercel    = origin && origin.endsWith('.vercel.app');
    const isEnvUrl    = process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL;

    if (isLocalhost || isVercel || isEnvUrl) {
      callback(null, true);
    } else {
      callback(new Error(`Acces CORS refuzat pentru originea: ${origin}`));
    }
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Parsare JSON cu limită mărită (necesară pentru imaginea base64 a radar chart-ului)
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// ============================================================
// Rute API
// ============================================================
app.use('/api', pdfRoutes);       // POST /api/generate-pdf
app.use('/api', benchmarkRoutes); // POST /api/save-result, GET /api/benchmark
app.use('/api', emailRoutes);     // POST /api/send-results

// Rută de verificare stare server (health check pentru Render)
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    serviciu: 'ERP Advisor Backend',
    versiune: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// ============================================================
// Middleware global pentru gestionarea erorilor
// ============================================================
app.use((err, req, res, next) => {
  console.error('❌ Eroare server:', err.message);
  res.status(500).json({
    eroare: 'Eroare internă a serverului',
    mesaj: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// ============================================================
// Pornire server după inițializarea bazei de date
// ============================================================
initDatabase()
  .then(() => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server ERP Advisor pornit pe portul ${PORT}`);
      console.log(`   POST /api/generate-pdf  — Generare raport PDF`);
      console.log(`   POST /api/save-result   — Salvare rezultat anonim`);
      console.log(`   GET  /api/benchmark     — Statistici benchmark`);
      console.log(`   GET  /health            — Health check`);
    });
  })
  .catch((err) => {
    console.error('❌ Nu s-a putut porni serverul:', err);
    process.exit(1);
  });
