import React from 'react';

export default function Button({ children, variant = 'primary', loading, ...props }) {
  const styles = {
    primary: {
      background: '#ffffff',
      color: '#111111',
      border: 'none',
      borderRadius: 50,
      padding: '15px',
      fontSize: 15,
      fontWeight: 600,
      width: '100%',
      opacity: loading ? 0.7 : 1,
    },
    accent: {
      background: 'var(--accent)',
      color: '#fff',
      border: 'none',
      borderRadius: 10,
      padding: '12px 20px',
      fontWeight: 600,
    },
    ghost: {
      background: 'none',
      border: 'none',
      color: 'var(--muted)',
      fontSize: 14,
      padding: '12px 16px',
    },
  };

  return (
    <button
      style={{ fontFamily: 'inherit', cursor: 'pointer', ...styles[variant] }}
      disabled={loading}
      {...props}
    >
      {loading ? 'Загрузка...' : children}
    </button>
  );
}