'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  DollarSign,
  ArrowLeft,
  Search,
  CreditCard,
  Receipt,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import { EstadiaAPI } from '../../../lib/api';

export default function TransaccionesPage() {
  const [loading, setLoading] = useState(true);
  const [transacciones, setTransacciones] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [filtroMetodo, setFiltroMetodo] = useState('TODOS');

  const [error, setError] = useState('');

  // Los pagos se obtienen de las estadías registradas en el backend
  const cargarPagosReales = async () => {
    setLoading(true);
    setError('');
    try {
      const listaEstadias = (await EstadiaAPI.getAll()) || [];

      const todosLosPagos = [];
      listaEstadias.forEach(estadia => {
        const pagosEstadia = estadia.pagos || [];
        pagosEstadia.forEach(pago => {
          todosLosPagos.push({
            id: pago.id || `${estadia.id}-${pago.fechaPago}`,
            codigoReserva: estadia.codigoReserva || 'WALK-IN',
            huesped: estadia.huesped ? `${estadia.huesped.nombres} ${estadia.huesped.apellidos}` : 'Huésped General',
            habitacion: estadia.habitacion?.numero || 'N/A',
            monto: Number(pago.monto || 0),
            metodoPago: (pago.metodoPago || 'EFECTIVO').toUpperCase(),
            fechaPago: pago.fechaPago || '',
            nroOperacion: pago.nroOperacion || 'S/N',
            tipoComprobante: pago.tipoComprobante || 'BOLETA',
            notas: pago.notas || ''
          });
        });
      });

      todosLosPagos.sort((a, b) => new Date(b.fechaPago) - new Date(a.fechaPago));
      setTransacciones(todosLosPagos);
    } catch (err) {
      console.error('Error al cargar transacciones', err);
      setError(err.message || 'No se pudieron cargar las transacciones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarPagosReales();
  }, []);

  const transaccionesFiltradas = transacciones.filter(tx => {
    const matchBusqueda = tx.huesped.toLowerCase().includes(busqueda.toLowerCase()) ||
                          tx.habitacion.toLowerCase().includes(busqueda.toLowerCase()) ||
                          tx.nroOperacion.toLowerCase().includes(busqueda.toLowerCase()) ||
                          tx.codigoReserva.toLowerCase().includes(busqueda.toLowerCase());
    const matchMetodo = filtroMetodo === 'TODOS' || tx.metodoPago === filtroMetodo;
    return matchBusqueda && matchMetodo;
  });

  const totalRecaudado = transacciones.reduce((acc, tx) => acc + tx.monto, 0);
  const totalEfectivo = transacciones.filter(tx => tx.metodoPago === 'EFECTIVO').reduce((acc, tx) => acc + tx.monto, 0);
  const totalDigital = totalRecaudado - totalEfectivo;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      
      {/* Header sin etiqueta de rol */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/VistaPersonal" className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl transition text-slate-700">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Registro de Transacciones & Caja • Hotel Princes Ica
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1 ml-10">
            Cobros y abonos reales sincronizados directamente desde los Check-Ins y salidas del hotel.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={cargarPagosReales}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
            title="Refrescar transacciones"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Tarjetas de Resumen Financiero Real */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-md flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Total Recaudado (Caja)</span>
            <h3 className="text-3xl font-black font-mono mt-1">S/ {totalRecaudado.toFixed(2)}</h3>
            <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> Basado en Check-Ins reales
            </p>
          </div>
          <span className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl">
            <DollarSign className="w-6 h-6" />
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Efectivo en Caja</span>
            <h3 className="text-2xl font-black text-slate-900 font-mono mt-1">S/ {totalEfectivo.toFixed(2)}</h3>
            <p className="text-[11px] text-slate-500 mt-1">Cobros físicos en recepción</p>
          </div>
          <span className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
            <Receipt className="w-6 h-6" />
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Billeteras & Tarjetas (Digital)</span>
            <h3 className="text-2xl font-black text-indigo-600 font-mono mt-1">S/ {totalDigital.toFixed(2)}</h3>
            <p className="text-[11px] text-slate-500 mt-1">Yape, Plin, POS</p>
          </div>
          <span className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
            <CreditCard className="w-6 h-6" />
          </span>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por huésped, N° habitación, operación o reserva..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-amber-500 transition"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filtroMetodo}
            onChange={(e) => setFiltroMetodo(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-amber-500"
          >
            <option value="TODOS">Todos los Métodos de Pago</option>
            <option value="EFECTIVO">Efectivo</option>
            <option value="YAPE">Yape / Plin</option>
            <option value="TARJETA">Tarjeta / POS</option>
          </select>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Historial de Cobros de Check-In</h3>
          <span className="text-xs text-slate-500">{transaccionesFiltradas.length} transacciones registradas</span>
          {error && <span className="text-xs font-semibold text-rose-600">{error}</span>}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <th className="p-4">Fecha / Hora</th>
                <th className="p-4">Huésped & Habitación</th>
                <th className="p-4">Comprobante / Operación</th>
                <th className="p-4">Método de Pago</th>
                <th className="p-4">Notas</th>
                <th className="p-4 text-right">Monto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {transaccionesFiltradas.length > 0 ? (
                transaccionesFiltradas.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-4 font-mono text-slate-500 whitespace-nowrap">
                      {new Date(tx.fechaPago).toLocaleString()}
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-slate-900">{tx.huesped}</div>
                      <div className="text-[11px] text-amber-600 font-semibold">Habitación {tx.habitacion}</div>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-800 rounded font-semibold text-[11px]">
                        {tx.tipoComprobante}
                      </span>
                      <div className="font-mono text-[11px] text-slate-500 mt-0.5">Op: {tx.nroOperacion}</div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-lg font-bold text-[10px] ${
                        tx.metodoPago === 'EFECTIVO' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        tx.metodoPago === 'YAPE' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                        'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}>
                        {tx.metodoPago}
                      </span>
                    </td>
                    <td className="p-4 text-slate-500 max-w-xs truncate">{tx.notas}</td>
                    <td className="p-4 text-right font-mono font-black text-sm text-slate-900 whitespace-nowrap">
                      S/ {tx.monto.toFixed(2)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="p-10 text-center text-slate-500">
                    Aún no hay transacciones registradas. Realiza un Check-In con pago inicial para verlas reflejadas aquí.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}