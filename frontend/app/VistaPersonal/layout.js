import React from 'react';

export default function VistaPersonalLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-900">
      {children}
    </div>
  );
}