import React from 'react';

export default function Card({ children, style }) {
  return (
    <div style={{
      background: 'var(--surface)',
      borderRadius: 'var(--radius)',
      padding: 20,
      ...style
    }}>
      {children}
    </div>
  );
}