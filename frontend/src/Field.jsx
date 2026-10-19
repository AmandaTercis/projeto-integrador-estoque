import React from 'react';

export default function Field({ label, required, error, children }) {
  return (
    <label className="field">
      <span>
        {label}
        {required && <b className="req"> *</b>}
      </span>
      {children}
      {error && <small className="erro" role="alert">{error}</small>}
    </label>
  );
}

export function Aviso({ aviso }) {
  if (!aviso) return null;
  return <div className={`aviso ${aviso.tipo}`} role="status">{aviso.texto}</div>;
}
