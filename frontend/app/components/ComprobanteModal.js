'use client';

import React from 'react';
import { Printer, CheckCircle, X, Hotel, Calendar, User, CreditCard, ShieldCheck } from 'lucide-react';

export default function ComprobanteModal({ data, isOpen, onClose }) {
  if (!isOpen || !data) return null;

  const fechaEmision = new Date().toLocaleDateString('es-PE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const handlePrint = () => {
    window.print();
  };

  const nroComprobante = `B001-${Math.floor(100000 + Math.random() * 900000)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden my-8 border border-slate-200">
        
        {/* Header Acciones (Oculto al imprimir) */}
        <div className="no-print flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <h3 className="font-semibold text-base text-slate-100">Check-Out Liquidado & Facturación</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-lg transition shadow-md"
            >
              <Printer className="w-4 h-4" /> Imprimir Comprobante
            </button>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Voucher Imprimible */}
        <div id="printable-voucher" className="p-8 text-slate-800 bg-white">
          {/* Logo & Hotel Info */}
          <div className="flex justify-between items-start border-b-2 border-amber-500/30 pb-6 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-slate-900 rounded-xl text-amber-400">
                  <Hotel className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-black tracking-tight text-slate-900">HOTEL PRINCES</h1>
                  <p className="text-xs font-semibold text-amber-600 uppercase tracking-widest">Oasis de Huacachina & Ica</p>
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Av. Los Balnearios 142, Ica - Perú<br />
                RUC: 20601928371 | Tel: (056) 219844
              </p>
            </div>

            <div className="text-right border border-slate-300 rounded-xl p-3 bg-slate-50">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">BOLETA DE VENTA ELECTRÓNICA</span>
              <span className="text-lg font-mono font-bold text-slate-900 block">{nroComprobante}</span>
              <span className="text-[11px] text-slate-500 block mt-1">{fechaEmision}</span>
            </div>
          </div>

          {/* Datos del Cliente y Estadía */}
          <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 mb-6 text-xs">
            <div>
              <span className="text-slate-400 uppercase font-semibold text-[10px] block">Huésped Titular</span>
              <p className="font-bold text-slate-900 text-sm mt-0.5">{data.huespedNombre || 'Cliente General'}</p>
              <p className="text-slate-600 mt-1">Habitación Asignada: <strong className="text-slate-900">N° {data.habitacionNumero}</strong></p>
            </div>
            <div>
              <span className="text-slate-400 uppercase font-semibold text-[10px] block">Período de Hospedaje</span>
              <p className="text-slate-700 mt-0.5">
                Ingreso: <span className="font-medium text-slate-900">{data.fechaIngreso ? new Date(data.fechaIngreso).toLocaleString('es-PE') : 'Hoy'}</span>
              </p>
              <p className="text-slate-700">
                Salida: <span className="font-medium text-slate-900">{data.fechaSalidaReal ? new Date(data.fechaSalidaReal).toLocaleString('es-PE') : 'Hoy'}</span>
              </p>
            </div>
          </div>

          {/* Tabla de Conceptos */}
          <table className="w-full text-left border-collapse mb-6 text-xs">
            <thead>
              <tr className="border-b border-slate-300 text-slate-500 uppercase text-[10px]">
                <th className="py-2 font-semibold">Descripción del Servicio</th>
                <th className="py-2 text-right font-semibold">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-2.5 text-slate-800">
                  <span className="font-semibold text-slate-900">Servicio de Hospedaje y Habitación #{data.habitacionNumero}</span>
                  <span className="block text-[11px] text-slate-500">Tarifa por noche y estadía completa</span>
                </td>
                <td className="py-2.5 text-right font-mono font-medium text-slate-900">
                  S/ {Number(data.totalHospedaje || 0).toFixed(2)}
                </td>
              </tr>
              {Number(data.totalConsumos || 0) > 0 && (
                <tr>
                  <td className="py-2.5 text-slate-800">
                    <span className="font-semibold text-slate-900">Consumos Adicionales y Frigobar / Bar</span>
                    <span className="block text-[11px] text-slate-500">Bebidas, snacks y servicios de cafetería</span>
                  </td>
                  <td className="py-2.5 text-right font-mono font-medium text-slate-900">
                    S/ {Number(data.totalConsumos || 0).toFixed(2)}
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Liquidación de Totales */}
          <div className="flex justify-between items-end border-t border-slate-300 pt-4 mb-6">
            <div className="text-xs text-slate-500 max-w-xs flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0" />
              <span>Comprobante emitido de acuerdo a la normativa de SUNAT para servicios de hospedaje.</span>
            </div>
            <div className="w-64 space-y-1.5 text-xs text-right">
              <div className="flex justify-between text-slate-600">
                <span>Total Facturado:</span>
                <span className="font-mono font-semibold text-slate-900">S/ {Number(data.totalPagar || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Total Abonado / Pagado:</span>
                <span className="font-mono font-semibold text-emerald-600">S/ {Number(data.totalPagado || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold border-t border-slate-200 pt-2 text-slate-900">
                <span>Saldo Pendiente:</span>
                <span className="font-mono text-emerald-600">S/ {Number(data.saldoFinal || 0).toFixed(2)} (LIQUIDADO)</span>
              </div>
            </div>
          </div>

          {/* Footer Voucher */}
          <div className="text-center pt-4 border-t border-dashed border-slate-200 text-slate-400 text-[11px]">
            ¡Gracias por hospedarse en Hotel Princes Ica! Esperamos verle pronto de regreso en el oasis.
          </div>
        </div>

        {/* Footer Modal */}
        <div className="no-print px-6 py-4 bg-slate-100 border-t border-slate-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition shadow"
          >
            Cerrar Ventana
          </button>
        </div>

      </div>
    </div>
  );
}
