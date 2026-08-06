import React from 'react';

export const CompatibilitySeal = ({ score = 90, reasoning = '', onClick }) => {
  const isHighMatch = score >= 90;
  const isMediumMatch = score >= 75 && score < 90;

  const sealColor = isHighMatch
    ? 'border-moss text-moss-deep dark:text-moss bg-moss/10'
    : isMediumMatch
    ? 'border-kraft text-kraft-deep dark:text-kraft bg-kraft/10'
    : 'border-rust text-rust-deep dark:text-rust bg-rust/10';

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative flex items-center gap-3 p-2 px-3 rounded-lg border-2 border-dashed ${sealColor} transition-all duration-200 hover:scale-[1.02] text-left focus:outline-none focus:ring-2 focus:ring-moss`}
      title="Click to view AI reasoning breakdown"
    >
      {/* Circular Stamped Badge */}
      <div className="w-12 h-12 rounded-full border-2 border-current flex flex-col items-center justify-center font-mono font-bold leading-none shrink-0 shadow-sm group-hover:rotate-6 transition-transform">
        <span className="text-sm">{score}%</span>
        <span className="text-[9px] uppercase tracking-tighter opacity-80">SEAL</span>
      </div>

      {/* One line reason in IBM Plex Mono */}
      <div className="font-mono text-xs overflow-hidden">
        <div className="font-semibold uppercase tracking-wider text-[10px] opacity-75">
          Compatibility Seal
        </div>
        <div className="truncate opacity-90 max-w-[280px]">
          {reasoning || `${score}% · matched by material, volume & location radius`}
        </div>
      </div>
    </button>
  );
};
