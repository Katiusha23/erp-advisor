# ERP Advisor

Platformă web pentru evaluarea pregătirii implementării ERP în IMM-uri din România și Moldova.

## Structura proiectului

```
erp-advisor/
├── backend/               # Node.js + Express
│   ├── routes/
│   │   ├── pdf.js         # POST /api/generate-pdf
│   │   └── benchmark.js   # POST /api/save-result, GET /api/benchmark
│   ├── db/
│   │   ├── database.js    # Conexiune SQLite
│   │   └── schema.sql     # Schema tabelelor
│   ├── index.js           # Punct de intrare server
│   └── package.json
└── frontend/              # React + Vite + Tailwind
    ├── src/
    │   ├── components/
    │   │   ├── Stepper.jsx
    │   │   ├── ProfileStep.jsx
    │   │   ├── AuditStep.jsx
    │   │   ├── ResultsStep.jsx
    │   │   └── RecommendationStep.jsx
    │   ├── utils/
    │   │   └── scoring.js  # Toată logica de calcul
    │   └── App.jsx
    └── package.json
```

---

## Pornire locală (development)

### 1. Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Serverul pornește pe `http://localhost:3001`.

### 2. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Aplicația este disponibilă la `http://localhost:5173`.

> Proxy-ul Vite redirecționează automat `/api` spre `http://localhost:3001`.

---

## Deploy pe Render (backend)

1. Creați un cont pe [render.com](https://render.com)
2. **New → Web Service** → conectați repository-ul GitHub
3. Configurați:
   - **Root Directory:** `erp-advisor/backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
4. Adăugați variabilele de mediu:
   ```
   FRONTEND_URL = https://erp-advisor.vercel.app   ← URL-ul Vercel de la pasul următor
   NODE_ENV     = production
   DATABASE_URL = ./db/erp_advisor.db
   ```
5. **Deploy** — copiați URL-ul serviciului (ex: `https://erp-advisor-api.onrender.com`)

---

## Deploy pe Vercel (frontend)

1. Creați un cont pe [vercel.com](https://vercel.com)
2. **Add New Project** → conectați repository-ul GitHub
3. Configurați:
   - **Root Directory:** `erp-advisor/frontend`
   - **Framework:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Adăugați variabila de mediu:
   ```
   VITE_API_URL = https://erp-advisor-api.onrender.com   ← URL-ul Render de la pasul anterior
   ```
5. **Deploy**

---

## Module principale

### Modulul 1 — ERP Readiness Audit
Chestionar în 4 pași:
- **Pasul 1** — Profilul companiei: țara, angajați, industrie, buget
- **Pasul 2** — Audit pe 5 dimensiuni (procese, financiar, IT, echipă, conformitate)
- **Pasul 3** — Rezultate cu radar chart, scor total și verdict colorat
- **Pasul 4** — Recomandare ERP + metodologie de implementare

### Modulul 2 — Backend
- `POST /api/generate-pdf` — Generează raport PDF profesional
- `POST /api/save-result` — Salvează rezultat anonim pentru benchmark
- `GET /api/benchmark` — Statistici agregate pe filtre
- `GET /api/benchmark/percentile` — Percentila unui scor față de date existente

---

## Sisteme ERP comparate

| ERP | Țară | Buget potrivit |
|-----|------|----------------|
| WinMentor | 🇷🇴 România | Sub 40k € |
| UNA Unisoft | 🇲🇩 Moldova | Sub 40k € |
| Saga Software | 🇷🇴🇲🇩 Ambele | Sub 15k € |
| Odoo Community | 🇷🇴🇲🇩 Ambele | 5k – 40k+ € |

## Metodologii recomandate

| Scor total | Metodologie | Durată |
|-----------|-------------|--------|
| ≥ 70% | Agile / Iterativă | 4–8 luni |
| 45–69% | Hibridă (Agile + Waterfall) | 6–12 luni |
| < 45% | Waterfall / Clasică | 9–18 luni |
