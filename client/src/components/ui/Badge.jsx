import React from 'react';

export const Badge = ({ children, variant = 'neutral', className = '' }) => {
  const styles = {
    neutral: 'bg-mycelium text-loam border-loam/20',
    moss: 'bg-moss/20 text-moss-deep dark:text-moss border-moss/40',
    kraft: 'bg-kraft/20 text-kraft-deep dark:text-kraft border-kraft/40',
    rust: 'bg-rust/20 text-rust-deep dark:text-rust border-rust/40',
    active: 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-500/30',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-medium border ${
        styles[variant] || styles.neutral
      } ${className}`}
    >
      {children}
    </span>
  );
};
