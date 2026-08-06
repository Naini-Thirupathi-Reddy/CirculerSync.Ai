import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Sparkles } from 'lucide-react';

export const AlertBanner = ({ weatherSignal }) => {
  const navigate = useNavigate();

  const handleMatchNow = () => {
    navigate('/matches');
  };

  return (
    <div className="p-4 rounded-xl bg-rust/10 border border-rust/30 text-loam flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-rust/20 text-rust-deep shrink-0">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-display font-bold text-sm text-loam">Predictive Waste Alert</h4>
          <p className="text-xs font-sans text-loam/80 mt-0.5">
            {weatherSignal?.condition || 'High volume surge predicted this weekend (~40kg extra material). Pre-match with local consumers now.'}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={handleMatchNow}
        className="px-4 py-2 rounded-lg bg-kraft hover:bg-kraft-deep text-parchment font-mono text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm shrink-0 self-end sm:self-center"
      >
        <Sparkles className="w-3.5 h-3.5" />
        <span>Match now →</span>
      </button>
    </div>
  );
};
