'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, XCircle, Clock } from 'lucide-react';
import { MercadoPagoAPI } from '../../../lib/api';
import { ClienteAPI } from '../../../lib/cliente';

// Página a la que vuelve el huésped después de pagar en Mercado Pago.
// El pago se confirma consultando a Mercado Pago desde el backend, no por los datos de la URL.

export default function ResultadoPagoPage() {
  const [estado, setEstado] = useState('verificando');
  const [detalle, setDetalle] = useState(null);
  const [error, setError] = useState('');
  const [esCliente, setEsCliente] = useState(false);

  useEffect(() => {
    setEsCliente(ClienteAPI.isAuthenticated());
    const params = new URLSearchParams(window.location.search);
    const paymentId = params.get('payment_id') || params.get('collection_id');
    if (!paymentId || paymentId === 'null') {
      setEstado(params.get('status') === 'pending' ? 'PENDIENTE' : 'RECHAZADO');
      return;
    }
    MercadoPagoAPI.verificar(paymentId)
      .then(r => { setDetalle(r); setEstado(r.estado); })
      .catch(err => { setError(err.message || 'No se pudo verificar el pago'); setEstado('error'); });
  }, []);

  const vistas = {
    APROBADO: { icono: CheckCircle2, color: 'text-emerald-600', titulo: 'Pago aprobado', texto: 'Su pago quedó registrado en el hotel. ¡Gracias!' },
    PENDIENTE: { icono: Clock, color: 'text-amber-600', titulo: 'Pago en proceso', texto: 'Mercado Pago está procesando el pago. El hotel lo verá apenas se confirme.' },
    RECHAZADO: { icono: XCircle, color: 'text-rose-600', titulo: 'Pago no realizado', texto: 'El pago fue rechazado o cancelado. Puede intentar de nuevo o pagar en recepción.' },
    error: { icono: XCircle, color: 'text-rose-600', titulo: 'No pudimos verificar el pago', texto: error }
  };
  const vista = vistas[estado];

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl border border-slate-200 shadow-sm p-6 text-center space-y-3">
        {estado === 'verificando' ? (
          <p className="text-sm text-slate-600">Verificando el pago con Mercado Pago…</p>
        ) : (
          <>
            {vista && <vista.icono className={`w-12 h-12 mx-auto ${vista.color}`} />}
            <h1 className="text-lg font-bold text-slate-900">{vista?.titulo}</h1>
            <p className="text-xs text-slate-600">{vista?.texto}</p>
            {detalle && (
              <p className="text-xs text-slate-500">{detalle.descripcion} · S/ {Number(detalle.monto).toFixed(2)}</p>
            )}
          </>
        )}
        <div className="flex flex-col gap-2 mt-2">
          {esCliente && (
            <Link href="/cuenta/reservas" className="px-4 py-2 rounded-xl bg-amber-400 text-slate-950 text-xs font-bold">Ver mis reservas</Link>
          )}
          <Link href="/" className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold">Volver al inicio</Link>
        </div>
      </div>
    </main>
  );
}
