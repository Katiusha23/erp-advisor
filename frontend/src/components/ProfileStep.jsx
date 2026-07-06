import { useState } from 'react';
import { INDUSTRY_CATEGORIES, INDUSTRY_SUBCATEGORIES } from '../utils/scoring.js';

const BUDGETS = [
  { value: 'sub5k',    label: 'Sub 5.000 €',           desc: 'Start-up sau buget foarte limitat' },
  { value: '5-15k',    label: '5.000 € – 15.000 €',    desc: 'Soluții accesibile pentru IMM' },
  { value: '15-40k',   label: '15.000 € – 40.000 €',   desc: 'Implementare mid-market' },
  { value: 'peste40k', label: 'Peste 40.000 €',         desc: 'Soluție enterprise completă' },
];

export default function ProfileStep({ profile, onChange, onNext }) {
  const [errors, setErrors] = useState({});

  const update = (field, value) => {
    onChange({ ...profile, [field]: value });
    if (errors[field]) setErrors({ ...errors, [field]: null });
  };

  const selectCategory = (cat) => {
    onChange({ ...profile, industrie_categorie: cat, industrie: '' });
    setErrors({ ...errors, industrie_categorie: null, industrie: null });
  };

  const selectSubcategory = (sub) => {
    onChange({ ...profile, industrie: sub });
    if (errors.industrie) setErrors({ ...errors, industrie: null });
  };

  const validate = () => {
    const e = {};
    if (!profile.industrie_categorie) e.industrie_categorie = 'Selectați domeniul principal de activitate';
    if (!profile.industrie)           e.industrie           = 'Selectați subcategoria specifică';
    if (!profile.buget)               e.buget               = 'Selectați bugetul estimat';
    if (!profile.are_erp)             e.are_erp             = 'Selectați situația actuală ERP';
    if (!profile.email)               e.email               = 'Adresa de email este necesară pentru a primi raportul și consultanța';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) e.email = 'Adresă de email invalidă';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (validate()) onNext();
  };

  const subcategories = profile.industrie_categorie
    ? INDUSTRY_SUBCATEGORIES[profile.industrie_categorie] || []
    : [];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 sm:p-8">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-slate-800">Profilul companiei</h2>
        <p className="text-sm text-slate-400 mt-1">Completați datele generale ale companiei dumneavoastră</p>
      </div>

      <div className="space-y-8">

        {/* ȚARA */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-3">Țara de operare</label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: 'RO', flag: '🇷🇴', label: 'România' },
              { value: 'MD', flag: '🇲🇩', label: 'Moldova' },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => update('tara', opt.value)}
                className={`
                  flex items-center gap-3 p-4 rounded-lg border-2 transition-colors
                  ${profile.tara === opt.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'}
                `}
              >
                <span className="text-2xl">{opt.flag}</span>
                <span className={`font-medium text-sm ${profile.tara === opt.value ? 'text-blue-700' : 'text-slate-700'}`}>
                  {opt.label}
                </span>
                {profile.tara === opt.value && (
                  <div className="ml-auto w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* NUMĂR ANGAJAȚI */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-3">
            Număr angajați
            <span className="ml-2 bg-slate-100 text-slate-700 font-medium px-2.5 py-0.5 rounded text-sm">
              {profile.nr_angajati}
            </span>
          </label>
          <input
            type="range"
            min={1}
            max={250}
            value={profile.nr_angajati}
            onChange={(e) => update('nr_angajati', parseInt(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>1</span><span>50</span><span>100</span><span>150</span><span>200</span><span>250</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            {profile.nr_angajati <= 10 && 'Micro-întreprindere (1–10 angajați)'}
            {profile.nr_angajati > 10  && profile.nr_angajati <= 50  && 'Întreprindere mică (11–50 angajați)'}
            {profile.nr_angajati > 50  && profile.nr_angajati <= 250 && 'Întreprindere mijlocie (51–250 angajați)'}
          </p>
        </div>

        {/* INDUSTRIA - PAS 1 */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Domeniu de activitate</label>
          <p className="text-xs text-slate-400 mb-3">Pasul 1 - alegeți categoria principală</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {INDUSTRY_CATEGORIES.map((cat) => {
              const isSelected = profile.industrie_categorie === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => selectCategory(cat.id)}
                  className={`
                    px-4 py-3 rounded-lg border-2 text-sm font-medium transition-colors text-left
                    ${isSelected
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'}
                  `}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
          {errors.industrie_categorie && (
            <p className="text-red-500 text-xs mt-2">{errors.industrie_categorie}</p>
          )}
        </div>

        {/* INDUSTRIA - PAS 2 */}
        {profile.industrie_categorie && (
          <div className="animate-slide-up">
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Subcategorie - {profile.industrie_categorie}
            </label>
            <p className="text-xs text-slate-400 mb-3">Pasul 2 - alegeți subcategoria specifică</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {subcategories.map((sub) => {
                const isSelected = profile.industrie === sub;
                return (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => selectSubcategory(sub)}
                    className={`
                      px-4 py-2.5 rounded-lg border-2 text-sm transition-colors text-left
                      ${isSelected
                        ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'}
                    `}
                  >
                    {isSelected && (
                      <span className="inline-flex w-4 h-4 bg-blue-500 rounded-full items-center justify-center mr-2">
                        <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                    )}
                    {sub}
                  </button>
                );
              })}
            </div>
            {errors.industrie && (
              <p className="text-red-500 text-xs mt-2">{errors.industrie}</p>
            )}
          </div>
        )}

        {/* BUGET */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-3">
            Buget estimat pentru implementarea ERP
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {BUDGETS.map((b) => (
              <button
                key={b.value}
                type="button"
                onClick={() => update('buget', b.value)}
                className={`
                  p-4 rounded-lg border-2 text-left transition-colors
                  ${profile.buget === b.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'}
                `}
              >
                <div className={`font-medium text-sm ${profile.buget === b.value ? 'text-blue-700' : 'text-slate-700'}`}>
                  {b.label}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">{b.desc}</div>
              </button>
            ))}
          </div>
          {errors.buget && <p className="text-red-500 text-xs mt-2">{errors.buget}</p>}
        </div>

        {/* EMAIL */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">
            Adresă de email
          </label>
          <input
            type="email"
            value={profile.email || ''}
            onChange={(e) => update('email', e.target.value)}
            placeholder="contact@firma.ro"
            className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm outline-none focus:border-blue-400 transition-colors"
          />
          <p className="text-xs text-slate-400 mt-1.5">
            Veți primi raportul ERP și veți fi contactat pentru consultanță personalizată.
          </p>
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
        </div>

        {/* TELEFON */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">
            Număr de telefon
            <span className="ml-2 text-xs font-normal text-slate-400">(opțional)</span>
          </label>
          <input
            type="tel"
            value={profile.telefon || ''}
            onChange={(e) => update('telefon', e.target.value)}
            placeholder="+40 700 000 000"
            className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm outline-none focus:border-blue-400 transition-colors"
          />
          <p className="text-xs text-slate-400 mt-1.5">
            Pentru consultanță telefonică după evaluare.
          </p>
        </div>

        {/* ARE ERP? */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Situația actuală ERP</label>
          <p className="text-xs text-slate-400 mb-3">Compania dumneavoastră folosește în prezent un sistem ERP?</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { value: 'nu',      label: 'Nu, căutăm o soluție',   desc: 'Prima implementare ERP' },
              { value: 'da_migr', label: 'Da, vrem să migrăm',     desc: 'Înlocuim sistemul existent' },
              { value: 'da_comp', label: 'Da, vrem să comparăm',   desc: 'Evaluăm alternative' },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => update('are_erp', opt.value)}
                className={`
                  p-4 rounded-lg border-2 text-left transition-colors
                  ${profile.are_erp === opt.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'}
                `}
              >
                <div className={`font-medium text-sm ${profile.are_erp === opt.value ? 'text-blue-700' : 'text-slate-700'}`}>
                  {opt.label}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">{opt.desc}</div>
              </button>
            ))}
          </div>
          {errors.are_erp && <p className="text-red-500 text-xs mt-2">{errors.are_erp}</p>}
        </div>

        {/* CE ERP FOLOSESC */}
        {(profile.are_erp === 'da_migr' || profile.are_erp === 'da_comp') && (
          <div className="animate-slide-up">
            <label className="block text-sm font-semibold text-slate-700 mb-3">
              Ce sistem ERP folosiți în prezent?
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {['WinMentor', 'Saga', 'UNA.md', 'Odoo', 'SAP', 'Microsoft Dynamics', 'Altul'].map((erp) => (
                <button
                  key={erp}
                  type="button"
                  onClick={() => update('erp_existent', erp)}
                  className={`
                    px-4 py-2.5 rounded-lg border-2 text-sm transition-colors text-left
                    ${profile.erp_existent === erp
                      ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'}
                  `}
                >
                  {erp}
                </button>
              ))}
            </div>
          </div>
        )}

      </div>

      <div className="mt-8 flex justify-end">
        <button
          onClick={handleNext}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-3 rounded-lg transition-colors flex items-center gap-2 text-sm"
        >
          Continuă
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
