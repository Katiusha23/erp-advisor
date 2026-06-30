import { useState } from 'react';

export default function Tooltip({ term, explanation, children }) {
  const [visible, setVisible] = useState(false);

  return (
    <span className="relative inline-flex items-center gap-0.5">
      {children || <span className="font-medium">{term}</span>}
      <button
        type="button"
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onFocus={() => setVisible(true)}
        onBlur={() => setVisible(false)}
        className="w-4 h-4 rounded-full bg-slate-200 hover:bg-blue-200 text-slate-500 hover:text-blue-700 flex items-center justify-center text-[10px] font-bold transition-colors flex-shrink-0 cursor-help"
        aria-label={`Explicație: ${term}`}
      >
        i
      </button>
      {visible && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-64 bg-slate-800 text-white text-xs rounded-xl p-3 shadow-xl leading-relaxed pointer-events-none">
          <p className="font-bold text-blue-300 mb-1">{term}</p>
          <p>{explanation}</p>
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800" />
        </div>
      )}
    </span>
  );
}

// Componentă utilă pentru text cu termeni tehnici inline
export function TermWithTooltip({ term, terms }) {
  const explanation = terms[term];
  if (!explanation) return <span>{term}</span>;
  return <Tooltip term={term} explanation={explanation} />;
}
