const BUGET_MAP = {
  'sub5k':    2500,
  '5-15k':    10000,
  '15-40k':   27500,
  'peste40k': 50000,
};

export function calcTCO(tcoData, profileBuget) {
  const oreManuale = parseFloat(tcoData.ore_manuale)        || 0;
  const costOrar   = parseFloat(tcoData.cost_orar)          || 0;
  const bugetImpl  = parseFloat(tcoData.buget_implementare) || BUGET_MAP[profileBuget] || 0;

  // ore_manuale = total ore/săptămână pierdute pe procese manuale (toți angajații)
  const costuriActuale = oreManuale * costOrar * 52;
  const economiiAnuale = costuriActuale * 0.65;

  const breakEvenLuni = (economiiAnuale > 0 && bugetImpl > 0)
    ? Math.ceil((bugetImpl / economiiAnuale) * 12)
    : null;

  const roi3ani = (bugetImpl > 0 && economiiAnuale > 0)
    ? Math.round(((economiiAnuale * 3 - bugetImpl) / bugetImpl) * 100)
    : null;

  return { costuriActuale, economiiAnuale, breakEvenLuni, roi3ani, bugetFolosit: bugetImpl };
}
