import React from 'react';

export const Button = ({
  children,
  variant = 'primary', // primary (moss), secondary (kraft), outline, danger (rust), ghost
  size = 'md', // sm, md, lg
  className = '',
  disabled = false,
  onClick,
  type = 'button',
  ...props
}) => {
  const baseStyle = 'inline-flex items-center justify-center font-medium rounded-md transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-moss disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-moss text-parchment hover:bg-moss-deep shadow-sm',
    secondary: 'bg-kraft text-loam hover:bg-kraft-deep hover:text-parchment shadow-sm',
    outline: 'border border-loam/20 text-loam hover:bg-mycelium',
    danger: 'bg-rust text-parchment hover:bg-rust-deep shadow-sm',
    ghost: 'text-loam hover:bg-mycelium/60',
  };

  const sizes = {
    sm: 'px-2.5 py-1 text-xs font-mono',
    md: 'px-4 py-2 text-sm font-sans',
    lg: 'px-5 py-2.5 text-base font-sans font-semibold',
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
