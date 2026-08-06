import React from 'react';

export const Card = ({ children, className = '', hoverable = true, ...props }) => {
  return (
    <div
      className={`bg-mycelium/70 border border-loam/10 rounded-lg p-5 shadow-sm transition-all duration-200 ${
        hoverable ? 'hover:-translate-y-1 hover:shadow-md hover:border-moss/30' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
