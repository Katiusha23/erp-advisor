import { useState } from 'react';

function PaymentModal({ onSuccess, onClose }) {
  const [card, setCard]       = useState({ nume: '', nr: '', expiry: '', cvv: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors]   = useState({});

  const formatCardNr = (v) => v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
  const formatExpiry = (v) => {
    const digits = v.replace(/\D/g, '').slice(0, 4);
    return digits.length > 2 ? digits.slice(0, 2) + '/' + digits.slice(2) : digits;
  };

  const handlePay = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); onSuccess(); }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md">
        <div className="border-b border-slate-200 p-5 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-800">Plată securizată</h2>
            <p className="text-sm text-slate-400">Plan Premium — 29 €</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center justify-center transition-colors">
            <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Nume titular card</label>
            <input
              type="text"
              placeholder="MARIA POPESCU"
              value={card.nume}
              onChange={(e) => setCard({ ...card, nume: e.target.value.toUpperCase() })}
              className={`w-full px-4 py-3 border-2 rounded-lg text-sm outline-none transition-colors ${errors.nume ? 'border-red-400' : 'border-slate-200 focus:border-blue-400'}`}
            />
            {errors.nume && <p className="text-red-500 text-xs mt-1">{errors.nume}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Număr card</label>
            <input
              type="text"
              placeholder="0000 0000 0000 0000"
              value={card.nr}
              onChange={(e) => setCard({ ...card, nr: formatCardNr(e.target.value) })}
              className={`w-full px-4 py-3 border-2 rounded-lg text-sm outline-none transition-colors ${errors.nr ? 'border-red-400' : 'border-slate-200 focus:border-blue-400'}`}
            />
            {errors.nr && <p className="text-red-500 text-xs mt-1">{errors.nr}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Data expirării</label>
              <input
                type="text"
                placeholder="MM/AA"
                value={card.expiry}
                onChange={(e) => setCard({ ...card, expiry: formatExpiry(e.target.value) })}
                className={`w-full px-4 py-3 border-2 rounded-lg text-sm outline-none transition-colors ${errors.expiry ? 'border-red-400' : 'border-slate-200 focus:border-blue-400'}`}
              />
              {errors.expiry && <p className="text-red-500 text-xs mt-1">{errors.expiry}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">CVV</label>
              <input
                type="password"
                placeholder="•••"
                maxLength={4}
                value={card.cvv}
                onChange={(e) => setCard({ ...card, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                className={`w-full px-4 py-3 border-2 rounded-lg text-sm outline-none transition-colors ${errors.cvv ? 'border-red-400' : 'border-slate-200 focus:border-blue-400'}`}
              />
              {errors.cvv && <p className="text-red-500 text-xs mt-1">{errors.cvv}</p>}
            </div>
          </div>

          <button
            onClick={handlePay}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-70 text-white font-medium py-3.5 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
          >
            {loading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Se procesează...
              </>
            ) : (
              'Plătește 29 €'
            )}
          </button>

          <div className="flex items-center justify-center gap-4 pt-1">
            {['Visa', 'Mastercard', 'PayPal'].map((b) => (
              <span key={b} className="text-xs text-slate-400 bg-slate-50 border border-slate-200 px-2 py-1 rounded">{b}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PlanStep({ onSelect }) {
  const [showPayment, setShowPayment] = useState(false);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Alegeți planul potrivit</h2>
        <p className="text-slate-400 text-sm">Selectați planul înainte de a începe evaluarea.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

        {/* Basic */}
        <div className="rounded-lg border-2 border-slate-200 p-6 flex flex-col hover:border-slate-300 hover:shadow-sm transition-all" style={{ background: '#c8ede9' }}>
          <div className="mb-5">
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Basic</span>
            <div className="mt-1 mb-1">
              <span className="text-3xl font-bold text-slate-900">Gratuit</span>
            </div>
            <p className="text-sm text-slate-700">Evaluare completă și recomandare ERP fără costuri.</p>
          </div>

          <ul className="space-y-2.5 flex-1 mb-6">
            {[
              { text: 'Audit pe 10 dimensiuni' },
              { text: 'Scor pregătire ERP' },
              { text: 'Recomandare sistem ERP' },
              { text: 'Comparație 4 sisteme' },
              { text: 'Raport PDF de bază' },
            ].map((f) => (
              <li key={f.text} className="flex items-start gap-2 text-sm">
                <span className="mt-0.5 flex-shrink-0 text-green-600">✓</span>
                <span className="text-slate-800">{f.text}</span>
              </li>
            ))}
          </ul>

          <button
            onClick={() => onSelect('basic')}
            className="w-full border-2 border-slate-300 hover:border-slate-400 text-slate-700 font-medium py-3 rounded-lg transition-colors text-sm hover:bg-slate-50"
          >
            Continuați cu Basic
          </button>
        </div>

        {/* Premium */}
        <div className="rounded-lg border-2 border-slate-300 p-6 flex flex-col relative shadow-sm" style={{ background: '#e2d0f0' }}>
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <span className="bg-slate-700 text-white text-sm font-medium px-4 py-1.5 rounded flex items-center gap-1.5">
              <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
              Recomandat
            </span>
          </div>

          <div className="mb-5">
            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Premium</span>
            <div className="flex items-baseline gap-1 mt-1 mb-1">
              <span className="text-3xl font-bold text-slate-900">29</span>
              <span className="text-lg font-semibold text-slate-700">€</span>
              <span className="text-slate-600 text-sm ml-1">plată unică</span>
            </div>
            <p className="text-sm text-slate-700">Analiză completă adaptată infrastructurii companiei.</p>
          </div>

          <ul className="space-y-2.5 flex-1 mb-6">
            {[
              { text: 'Audit pe 10 dimensiuni',                extra: false },
              { text: 'Scor pregătire ERP',                    extra: false },
              { text: 'Recomandare sistem ERP',                extra: false },
              { text: 'Comparație 4 sisteme',                  extra: false },
              { text: 'Raport PDF',                            extra: false },
              { text: 'Audit tehnic: OS, rețea, administrare', extra: true  },
              { text: 'Audit firewall & politici securitate',  extra: true  },
              { text: 'Consultanță personalizată pe email',    extra: true  },
            ].map((f) => (
              <li key={f.text} className="flex items-start gap-2 text-sm">
                <span className={`mt-0.5 font-bold flex-shrink-0 ${f.extra ? 'text-blue-600' : 'text-green-600'}`}>✓</span>
                <span className="text-slate-800 font-medium">{f.text}</span>
              </li>
            ))}
          </ul>

          <button
            onClick={() => setShowPayment(true)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors text-sm"
          >
            Continuați cu Premium
          </button>
        </div>

      </div>

      {showPayment && (
        <PaymentModal
          onSuccess={() => { setShowPayment(false); onSelect('premium'); }}
          onClose={() => setShowPayment(false)}
        />
      )}
    </div>
  );
}
