// ============================================================
// Rută API pentru generarea raportului PDF profesional
// Folosește pdfmake + Roboto (Unicode complet, diacritice OK)
// ============================================================

const express    = require('express');
const router     = express.Router();
const path       = require('path');
const fs         = require('fs');
const PdfPrinter = require('pdfmake/src/printer');
const vfsFonts   = require('pdfmake/build/vfs_fonts');

// Extrage fonturile Roboto din VFS-ul pdfmake și le scrie pe disc o singură dată
const FONTS_DIR = path.join(__dirname, '..', 'fonts');
if (!fs.existsSync(FONTS_DIR)) fs.mkdirSync(FONTS_DIR);
for (const [name, b64] of Object.entries(vfsFonts)) {
  const dest = path.join(FONTS_DIR, name);
  if (!fs.existsSync(dest)) fs.writeFileSync(dest, Buffer.from(b64, 'base64'));
}

const printer = new PdfPrinter({
  Roboto: {
    normal:      path.join(FONTS_DIR, 'Roboto-Regular.ttf'),
    bold:        path.join(FONTS_DIR, 'Roboto-Medium.ttf'),
    italics:     path.join(FONTS_DIR, 'Roboto-Italic.ttf'),
    bolditalics: path.join(FONTS_DIR, 'Roboto-MediumItalic.ttf'),
  },
});

// ------------------------------------------------------------
// POST /api/generate-pdf
// Body JSON: { profil, scoruri, scorTotal, verdict,
//              erpRecomandat, metodologie, radarChartImage, benchmarkInfo }
// Răspuns: fișier PDF ca attachment
// ------------------------------------------------------------
router.post('/generate-pdf', async (req, res) => {
  try {
    const {
      profil,
      scoruri,
      scorTotal,
      verdict,
      erpRecomandat,
      metodologie,
      radarChartImage,
      benchmarkInfo,
    } = req.body;

    // Paletă culori
    const C = {
      primary:   '#1e3a5f',
      blue:      '#3b82f6',
      dark:      '#1e293b',
      gray:      '#64748b',
      lightGray: '#f1f5f9',
      border:    '#e2e8f0',
      green:     '#16a34a',
      yellow:    '#d97706',
      red:       '#dc2626',
      white:     '#ffffff',
    };

    const total = scorTotal || 0;
    const verdictColor     = total >= 75 ? C.green  : total >= 45 ? C.yellow  : C.red;
    const verdictBg        = total >= 75 ? '#dcfce7': total >= 45 ? '#fef9c3' : '#fee2e2';
    const verdictTextColor = total >= 75 ? '#166534': total >= 45 ? '#854d0e' : '#991b1b';
    const verdictLabel     = verdict?.label || (total >= 75 ? 'Pregătit pentru ERP' : total >= 45 ? 'Pregătire Parțială' : 'Necesită Pregătire');

    const dataRaport = new Date().toLocaleDateString('ro-RO', {
      day: '2-digit', month: 'long', year: 'numeric',
    });

    // ============================================================
    // Secțiunea 3 - rânduri de scoruri cu bară de progres canvas
    // ============================================================
    const dimensiuni = [
      { id: 'procese',      label: 'Procese Interne' },
      { id: 'financiar',    label: 'Resurse Financiare' },
      { id: 'it',           label: 'Capacitate IT' },
      { id: 'echipa',       label: 'Pregătire Echipă' },
      { id: 'conformitate', label: 'Conformitate Legislativă' },
      { id: 'securitate',          label: 'Securitate & Date' },
      { id: 'infrastructura_date', label: 'Infrastructură Date' },
      { id: 'aplicatii_sw',        label: 'Aplicații Software' },
      { id: 'prezenta_online',     label: 'Prezență Online' },
      { id: 'colaborare',          label: 'Colaborare & Groupware' },
    ];

    const scoruriRows = dimensiuni.map(({ id, label }) => {
      const raw   = scoruri?.[id] || 0;
      // Formula corectă: ((raw-1)/3)*100, identică cu calculateDimensionScore din frontend
      const pct   = raw > 0 ? Math.round(((raw - 1) / 3) * 100) : 0;
      const color = pct >= 67 ? C.green : pct >= 45 ? C.yellow : C.red;
      const barW  = Math.max(Math.round(430 * pct / 100), 2);

      return [
        {
          stack: [
            { text: label, fontSize: 9, color: C.gray, margin: [0, 0, 0, 4] },
            {
              canvas: [
                { type: 'rect', x: 0, y: 0, w: 430, h: 9, r: 4, color: '#e2e8f0' },
                { type: 'rect', x: 0, y: 0, w: barW, h: 9, r: 4, color },
              ],
            },
          ],
          border: [false, false, false, false],
          margin: [0, 5, 10, 5],
        },
        {
          text: `${pct}%`,
          fontSize: 10,
          bold: true,
          color,
          alignment: 'right',
          border: [false, false, false, false],
          margin: [0, 10, 0, 5],
        },
      ];
    });

    // ============================================================
    // Secțiunea 5 - faze metodologie
    // ============================================================
    const phaseBlocks = (metodologie?.phases || []).map((ph, i) => ({
      margin: [0, 0, 0, 10],
      table: {
        widths: [36, '*'],
        body: [[
          {
            text: `${i + 1}`,
            fontSize: 14,
            bold: true,
            color: C.white,
            alignment: 'center',
            fillColor: C.blue,
            border: [false, false, false, false],
            margin: [0, 14, 0, 0],
          },
          {
            stack: [
              { text: ph.title || `Etapa ${i + 1}`, fontSize: 11, bold: true, color: C.dark },
              { text: ph.duration || '', fontSize: 9, color: C.blue, margin: [0, 3, 0, 4] },
              { text: ph.desc || '', fontSize: 9, color: C.gray },
            ],
            fillColor: C.lightGray,
            border: [false, false, false, false],
            margin: [12, 10, 10, 10],
          },
        ]],
      },
      layout: 'noBorders',
    }));

    // ============================================================
    // Construire conținut document
    // ============================================================
    const content = [

      // ── HEADER (fundal albastru extins la marginile paginii) ──
      {
        margin: [-50, -50, -50, 24],
        table: {
          widths: ['*'],
          body: [[{
            stack: [
              { text: 'ERP Advisor', fontSize: 28, bold: true, color: C.white, margin: [0, 0, 0, 6] },
              { text: 'Raport de Evaluare - Pregătire pentru Implementare ERP', fontSize: 12, color: '#93c5fd' },
              { text: `Generat la: ${dataRaport}`, fontSize: 10, color: '#94a3b8', margin: [0, 6, 0, 0] },
            ],
            fillColor: C.primary,
            border: [false, false, false, false],
            margin: [50, 24, 50, 24],
          }]],
        },
        layout: 'noBorders',
      },

      // ── 1. PROFIL COMPANIE ─────────────────────────────────────
      { text: '1. Profilul Companiei', style: 'sectionTitle' },
      { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 495, y2: 0, lineWidth: 1, lineColor: C.border }], margin: [0, 0, 0, 12] },
      {
        table: {
          widths: ['*', '*'],
          body: [
            [
              {
                stack: [
                  { text: 'Țara', fontSize: 9, color: C.gray },
                  { text: profil?.tara === 'RO' ? 'România' : 'Moldova', fontSize: 11, bold: true, color: C.dark },
                ],
                border: [false, false, false, false],
              },
              {
                stack: [
                  { text: 'Industria', fontSize: 9, color: C.gray },
                  { text: profil?.industrie || '-', fontSize: 11, bold: true, color: C.dark },
                  ...(profil?.industrie_subcategorie ? [
                    { text: profil.industrie_subcategorie, fontSize: 9, color: C.blue, margin: [0, 2, 0, 0] },
                  ] : []),
                ],
                border: [false, false, false, false],
              },
            ],
            [
              {
                stack: [
                  { text: 'Nr. angajați', fontSize: 9, color: C.gray },
                  { text: `${profil?.nr_angajati || '-'} persoane`, fontSize: 11, bold: true, color: C.dark },
                ],
                border: [false, false, false, false],
                margin: [0, 8, 0, 0],
              },
              {
                stack: [
                  { text: 'Buget estimat', fontSize: 9, color: C.gray },
                  { text: formatBuget(profil?.buget), fontSize: 11, bold: true, color: C.dark },
                ],
                border: [false, false, false, false],
                margin: [0, 8, 0, 0],
              },
            ],
          ],
        },
        layout: 'noBorders',
        margin: [0, 0, 0, 20],
      },

      // ── 2. RADAR CHART ─────────────────────────────────────────
      ...(radarChartImage ? [
        { text: '2. Radar Chart - Scoruri per Dimensiune', style: 'sectionTitle' },
        { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 495, y2: 0, lineWidth: 1, lineColor: C.border }], margin: [0, 0, 0, 12] },
        {
          image: radarChartImage,
          width: 260,
          alignment: 'center',
          margin: [0, 0, 0, 20],
        },
      ] : []),

      // ── 3. SCORURI PE DIMENSIUNI ───────────────────────────────
      { text: '3. Scoruri pe Dimensiuni', style: 'sectionTitle' },
      { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 495, y2: 0, lineWidth: 1, lineColor: C.border }], margin: [0, 0, 0, 12] },
      {
        table: {
          widths: ['*', 42],
          body: scoruriRows,
        },
        layout: 'noBorders',
        margin: [0, 0, 0, 16],
      },

      // ── VERDICT ────────────────────────────────────────────────
      {
        table: {
          widths: [5, '*', 90],
          body: [[
            {
              text: '',
              fillColor: verdictColor,
              border: [false, false, false, false],
            },
            {
              text: `Verdict: ${verdictLabel}`,
              fontSize: 13,
              bold: true,
              color: verdictTextColor,
              fillColor: verdictBg,
              border: [false, false, false, false],
              margin: [14, 16, 0, 16],
            },
            {
              text: `${total}%`,
              fontSize: 26,
              bold: true,
              color: verdictColor,
              fillColor: verdictBg,
              alignment: 'right',
              border: [false, false, false, false],
              margin: [0, 10, 14, 10],
            },
          ]],
        },
        layout: 'noBorders',
        margin: [0, 0, 0, 12],
      },

      // ── BENCHMARK ─────────────────────────────────────────────
      ...(benchmarkInfo && benchmarkInfo.total_companii > 0 ? [{
        table: {
          widths: ['*'],
          body: [[{
            text: `Compania ta e mai pregătită decât ${benchmarkInfo.percentila}% din IMM-urile similare (din ${benchmarkInfo.total_companii} companii analizate)`,
            fontSize: 10,
            color: '#1d4ed8',
            fillColor: '#eff6ff',
            border: [false, false, false, false],
            margin: [14, 12, 14, 12],
          }]],
        },
        layout: 'noBorders',
        margin: [0, 0, 0, 0],
      }] : []),

      // ── PAGINA 2 ───────────────────────────────────────────────
      { text: '4. Recomandare ERP', style: 'sectionTitle', pageBreak: 'before' },
      { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 495, y2: 0, lineWidth: 1, lineColor: C.border }], margin: [0, 0, 0, 12] },

      ...(erpRecomandat ? [
        // Card ERP
        {
          table: {
            widths: [5, '*'],
            body: [[
              {
                text: '',
                fillColor: C.blue,
                border: [false, false, false, false],
              },
              {
                stack: [
                  { text: erpRecomandat.name || '-', fontSize: 20, bold: true, color: '#1e40af' },
                  { text: `Compatibilitate: ${erpRecomandat.compatibility || '-'}%`, fontSize: 10, bold: true, color: C.blue, margin: [0, 8, 0, 6] },
                  { text: erpRecomandat.description || '', fontSize: 9, color: C.gray },
                ],
                fillColor: '#eff6ff',
                border: [false, false, false, false],
                margin: [14, 14, 14, 14],
              },
            ]],
          },
          layout: 'noBorders',
          margin: [0, 0, 0, 16],
        },

        ...(erpRecomandat.pros?.length ? [
          { text: 'Avantaje:', fontSize: 10, bold: true, color: C.dark, margin: [0, 0, 0, 8] },
          ...erpRecomandat.pros.map(p => ({
            text: `•  ${p}`, fontSize: 9, color: C.green, margin: [14, 0, 0, 4],
          })),
          { text: '', margin: [0, 0, 0, 6] },
        ] : []),

        ...(erpRecomandat.cons?.length ? [
          { text: 'Limitări:', fontSize: 10, bold: true, color: C.dark, margin: [0, 0, 0, 8] },
          ...erpRecomandat.cons.map(c => ({
            text: `•  ${c}`, fontSize: 9, color: C.red, margin: [14, 0, 0, 4],
          })),
          { text: '', margin: [0, 0, 0, 10] },
        ] : []),
      ] : []),

      // ── 5. METODOLOGIE ─────────────────────────────────────────
      { text: '5. Metodologie Recomandată de Implementare', style: 'sectionTitle' },
      { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 495, y2: 0, lineWidth: 1, lineColor: C.border }], margin: [0, 0, 0, 12] },

      ...(metodologie ? [
        { text: metodologie.name || '-', fontSize: 15, bold: true, color: '#1d4ed8', margin: [0, 0, 0, 6] },
        { text: `Durată estimată: ${metodologie.duration || '-'}`, fontSize: 9, color: C.gray, margin: [0, 0, 0, 8] },
        { text: metodologie.description || '', fontSize: 10, color: C.dark, margin: [0, 0, 0, 16] },
        ...(metodologie.phases?.length ? [
          { text: 'Plan de acțiune în 3 etape:', fontSize: 12, bold: true, color: C.dark, margin: [0, 0, 0, 12] },
          ...phaseBlocks,
        ] : []),
      ] : []),

    ];

    // ============================================================
    // Definiție document pdfmake
    // ============================================================
    const docDefinition = {
      pageSize:    'A4',
      pageMargins: [50, 50, 50, 60],
      defaultStyle: { font: 'Roboto', fontSize: 10, color: C.dark },
      styles: {
        sectionTitle: {
          fontSize: 14, bold: true, color: C.dark, margin: [0, 10, 0, 6],
        },
      },
      footer: (currentPage, pageCount) => ({
        text: `ERP Advisor © ${new Date().getFullYear()}  |  Raport generat automat  |  Pagina ${currentPage} din ${pageCount}`,
        fontSize: 8,
        color: '#94a3b8',
        alignment: 'center',
        margin: [50, 12, 50, 0],
      }),
      info: {
        title:   'Raport ERP Advisor',
        author:  'ERP Advisor Platform',
        subject: 'Evaluare pregătire implementare ERP',
      },
      content,
    };

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="raport-erp-advisor.pdf"');

    const pdfDoc = printer.createPdfKitDocument(docDefinition);
    pdfDoc.pipe(res);
    pdfDoc.end();

  } catch (error) {
    console.error('Eroare la generarea PDF-ului:', error);
    if (!res.headersSent) {
      res.status(500).json({ eroare: 'Nu s-a putut genera raportul PDF' });
    }
  }
});

// ============================================================
// Helpers
// ============================================================
function formatBuget(buget) {
  const map = {
    'sub5k':    'Sub 5.000 €',
    '5-15k':    '5.000 € - 15.000 €',
    '15-40k':   '15.000 € - 40.000 €',
    'peste40k': 'Peste 40.000 €',
  };
  return map[buget] || buget || '-';
}


module.exports = router;
