import React from 'react';

export default function Input({ label, error, type = 'text', ...props }) {
  return (
    <div style={{ marginBottom: 20 }}>
      {label && (
        <label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 8 }}>
          {label}
        </label>
      )}
      <input
        type={type}
        style={{
          width: '100%',
          background: 'var(--surface)',
          border: `1.5px solid ${error ? 'var(--error)' : 'var(--border)'}`,
          borderRadius: 12,
          padding: '14px 16px',
          outline: 'none',
          fontFamily: 'inherit',
          fontSize: 15,
          color: 'var(--text)'
        }}
        {...props}
      />
      {error && (
        <div style={{ color: 'var(--error)', fontSize: 12, marginTop: 6 }}>{error}</div>
      )}
    </div>
  );
}