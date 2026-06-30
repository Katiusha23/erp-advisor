const express    = require('express');
const router     = express.Router();
const nodemailer = require('nodemailer');

// Configurare transporter — folosește variabile de mediu din .env
// Pentru dezvoltare locală, setați EMAIL_USER și EMAIL_PASS în .env
// Exemplu .env:
//   EMAIL_USER=erpadvisor@gmail.com
//   EMAIL_PASS=your_app_password
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ------------------------------------------------------------
// POST /api/send-results — trimite rezultatele pe email
// ------------------------------------------------------------
router.post('/send-results', async (req, res) => {
  const { email, profil, scorTotal, verdict, erpRecomandat, plan, techAnswers } = req.body;

  if (!email) {
    return res.status(400).json({ eroare: 'Adresa de email este obligatorie.' });
  }

  const isPremium = plan === 'premium';

  // Secțiunea de audit tehnic (doar pentru premium)
  const techSection = isPremium && techAnswers && Object.keys(techAnswers).length > 0
    ? `
      <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:12px;padding:20px;margin-top:20px;">
        <h3 style="color:#92400e;margin:0 0 12px 0;font-size:15px;">⭐ Audit Tehnic Avansat (Premium)</h3>
        <table style="width:100%;border-collapse:collapse;font-size:13px;">
          ${Object.entries(techAnswers).map(([key, val]) => `
            <tr>
              <td style="padding:6px 8px;color:#78716c;border-bottom:1px solid #fef3c7;width:40%">${key.replace(/_/g, ' ')}</td>
              <td style="padding:6px 8px;font-weight:600;color:#44403c;border-bottom:1px solid #fef3c7;">${val}</td>
            </tr>
          `).join('')}
        </table>
      </div>
    `
    : '';

  const consultantaSection = isPremium
    ? `
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:20px;margin-top:20px;">
        <h3 style="color:#166534;margin:0 0 12px 0;font-size:15px;">💬 Consultanță Personalizată</h3>
        <p style="color:#374151;font-size:13px;margin:0 0 10px 0;">
          Felicitări pentru completarea auditului premium! Pe baza răspunsurilor dumneavoastră, echipa ERP Advisor vă va contacta
          în maxim 48 de ore cu o analiză detaliată și recomandări specifice pentru implementarea <strong>${erpRecomandat?.name || 'ERP'}</strong>
          în compania dumneavoastră.
        </p>
        <p style="color:#374151;font-size:13px;margin:0 0 10px 0;">
          Ce urmează:
        </p>
        <ul style="color:#374151;font-size:13px;margin:0;padding-left:20px;">
          <li style="margin-bottom:6px;">Analiză compatibilitate infrastructură IT cu ${erpRecomandat?.name || 'ERP-ul recomandat'}</li>
          <li style="margin-bottom:6px;">Calcul TCO detaliat adaptat dimensiunii companiei dumneavoastră</li>
          <li style="margin-bottom:6px;">Plan de implementare personalizat pe etape</li>
          <li>Recomandări furnizori implementare din România / Moldova</li>
        </ul>
      </div>
    `
    : `
      <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:20px;margin-top:20px;">
        <h3 style="color:#1e40af;margin:0 0 8px 0;font-size:15px;">⭐ Doriți o analiză mai aprofundată?</h3>
        <p style="color:#374151;font-size:13px;margin:0 0 10px 0;">
          Planul Premium (29 €) include audit tehnic avansat (compatibilitate OS, rețea, firewall),
          calculator TCO pe 3 ani și consultanță personalizată de la experți ERP.
        </p>
      </div>
    `;

  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;color:#1f2937;">

      <!-- Header -->
      <div style="background:linear-gradient(135deg,#2563eb,#4f46e5);border-radius:16px;padding:28px;text-align:center;margin-bottom:24px;">
        <h1 style="color:white;margin:0;font-size:24px;">ERP Advisor</h1>
        <p style="color:#bfdbfe;margin:6px 0 0 0;font-size:14px;">Rezultatele evaluării dumneavoastră</p>
      </div>

      <!-- Scor total -->
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:20px;margin-bottom:16px;text-align:center;">
        <p style="color:#64748b;font-size:13px;margin:0 0 8px 0;">Scor total pregătire ERP</p>
        <div style="font-size:48px;font-weight:900;color:${scorTotal >= 75 ? '#16a34a' : scorTotal >= 45 ? '#d97706' : '#dc2626'};">
          ${scorTotal}%
        </div>
        <div style="display:inline-block;background:${scorTotal >= 75 ? '#dcfce7' : scorTotal >= 45 ? '#fef3c7' : '#fee2e2'};
          color:${scorTotal >= 75 ? '#166534' : scorTotal >= 45 ? '#92400e' : '#991b1b'};
          padding:4px 14px;border-radius:20px;font-size:13px;font-weight:600;margin-top:8px;">
          ${verdict?.label || ''}
        </div>
      </div>

      <!-- ERP Recomandat -->
      <div style="background:linear-gradient(135deg,#2563eb,#4338ca);border-radius:12px;padding:20px;margin-bottom:16px;color:white;">
        <p style="margin:0 0 4px 0;font-size:12px;color:#bfdbfe;">ERP Recomandat</p>
        <h2 style="margin:0 0 4px 0;font-size:22px;">${erpRecomandat?.name || ''} — ${erpRecomandat?.compatibility || 0}% compatibilitate</h2>
        <p style="margin:0;font-size:13px;color:#bfdbfe;">${erpRecomandat?.description || ''}</p>
      </div>

      <!-- Profil companie -->
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:16px;margin-bottom:16px;">
        <h3 style="margin:0 0 12px 0;font-size:14px;color:#374151;">📋 Profilul companiei</h3>
        <table style="width:100%;font-size:13px;border-collapse:collapse;">
          <tr><td style="padding:4px 0;color:#64748b;">Industrie:</td><td style="font-weight:600;">${profil?.industrie_categorie || ''} — ${profil?.industrie || ''}</td></tr>
          <tr><td style="padding:4px 0;color:#64748b;">Angajați:</td><td style="font-weight:600;">${profil?.nr_angajati || ''}</td></tr>
          <tr><td style="padding:4px 0;color:#64748b;">Țara:</td><td style="font-weight:600;">${profil?.tara === 'RO' ? 'România' : 'Moldova'}</td></tr>
          <tr><td style="padding:4px 0;color:#64748b;">Buget:</td><td style="font-weight:600;">${profil?.buget || ''}</td></tr>
        </table>
      </div>

      ${techSection}
      ${consultantaSection}

      <!-- Footer -->
      <div style="text-align:center;margin-top:28px;padding-top:16px;border-top:1px solid #e2e8f0;">
        <p style="color:#94a3b8;font-size:12px;margin:0;">
          ERP Advisor © ${new Date().getFullYear()} — Instrument de evaluare ERP pentru IMM-uri din România și Moldova
        </p>
        <p style="color:#94a3b8;font-size:11px;margin:6px 0 0 0;">
          Ați primit acest email deoarece ați completat un audit ERP pe erpadvisor.ro
        </p>
      </div>

    </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from:    `"ERP Advisor" <${process.env.EMAIL_USER}>`,
      to:      email,
      subject: `Rezultatele auditului ERP — ${erpRecomandat?.name || 'Recomandare personalizată'}`,
      html,
    });

    res.json({ success: true, mesaj: 'Email trimis cu succes.' });
  } catch (err) {
    console.error('❌ Eroare trimitere email:', err.message);
    res.status(500).json({
      eroare: 'Nu s-a putut trimite emailul.',
      detalii: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
});

module.exports = router;
