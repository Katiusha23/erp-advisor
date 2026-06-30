export function calcTCO(tcoData, erpName) {
  const oreManuale  = parseFloat(tcoData.ore_manuale)       || 0;
  const nrAngajati  = parseFloat(tcoData.nr_angajati_erp)   || 0;
  const costOrar    = parseFloat(tcoData.cost_orar)         || 0;
  const costImpl    = parseFloat(tcoData.cost_implementare) || 0;

  const costuriActuale   = oreManuale * nrAngajati * costOrar * 52;
  const reducere         = 0.65;
  const economiiAnuale   = costuriActuale * reducere;

  const costuriErp = {
    'WinMentor':   { licenta: 1200, mentenanta: 600,  implementare: costImpl || 3000 },
    'Saga':        { licenta: 800,  mentenanta: 400,  implementare: costImpl || 2000 },
    'UNA.md': { licenta: 2500, mentenanta: 1000, implementare: costImpl || 5000 },
    // Odoo Community (open-source, fără licență). Odoo Enterprise: ~14€/user/lună (exclus din calcul)
    'Odoo':        { licenta: 0,    mentenanta: 1500, implementare: costImpl || 8000 },
  };

  const costuri = costuriErp[erpName] || costuriErp['Saga'];
  const tco1an  = costuri.licenta + costuri.mentenanta + costuri.implementare;
  const tco3ani = costuri.licenta + costuri.mentenanta * 3 + costuri.implementare;
  const breakEvenLuni = economiiAnuale > 0
    ? Math.ceil((tco1an / economiiAnuale) * 12)
    : null;

  const beneficii3ani = economiiAnuale * 3;
  const roi3ani = tco3ani > 0
    ? Math.round(((beneficii3ani - tco3ani) / tco3ani) * 100)
    : null;

  return { costuriActuale, economiiAnuale, tco1an, tco3ani, breakEvenLuni, roi3ani, costuri };
}
