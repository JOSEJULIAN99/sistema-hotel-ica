'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  DollarSign,
  BedDouble,
  Package,
  TrendingUp,
  Download,
  BarChart3,
  ArrowLeft
} from 'lucide-react';
import { EstadiaAPI, HabitacionAPI } from '../../../lib/api';

export default function ReportesPage() {
  const [loading, setLoading] = useState(true);
  
  const [statsReporte, setStatsReporte] = useState({
    totalIngresos: 0,
    efectivoTotal: 0,
    digitalTotal: 0,
    totalHabitaciones: 0,
    habitacionesOcupadas: 0,
    porcentajeOcupacion: 0,
    totalInsumos: 0,
    insumosBajoStock: 0,
    totalCheckIns: 0
  });

  const [listaInsumos, setListaInsumos] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    // Ingresos y ocupación vienen del backend; el inventario de almacén aún es local (sin módulo en el servidor)
    async function cargarReporte() {
      try {
        const [estadias, habitaciones] = await Promise.all([
          EstadiaAPI.getAll(),
          HabitacionAPI.getAll()
        ]);
        let almacen = [];
        try {
          almacen = JSON.parse(localStorage.getItem('hotel_almacen')) || [];
        } catch (e) {
          almacen = [];
        }
        setListaInsumos(almacen);

        let ingresosAcumulados = 0;
        let efectivoAcumulado = 0;
        let digitalAcumulado = 0;

        (estadias || []).forEach(est => {
          (est.pagos || []).forEach(p => {
            const monto = Number(p.monto || 0);
            ingresosAcumulados += monto;
            if ((p.metodoPago || '').toUpperCase() === 'EFECTIVO') {
              efectivoAcumulado += monto;
            } else {
              digitalAcumulado += monto;
            }
          });
        });

        const listaHab = habitaciones || [];
        const totalHab = listaHab.length;
        const ocupadas = listaHab.filter(h => (h.estado || '').toUpperCase() === 'OCUPADA').length;
        const pctOcupacion = totalHab > 0 ? Math.round((ocupadas / totalHab) * 100) : 0;
        const bajoStock = almacen.filter(i => i.stock <= i.stockMinimo).length;

        setStatsReporte({
          totalIngresos: ingresosAcumulados,
          efectivoTotal: efectivoAcumulado,
          digitalTotal: digitalAcumulado,
          totalHabitaciones: totalHab,
          habitacionesOcupadas: ocupadas,
          porcentajeOcupacion: pctOcupacion,
          totalInsumos: almacen.length,
          insumosBajoStock: bajoStock,
          totalCheckIns: (estadias || []).length
        });
      } catch (err) {
        console.error('Error calculando reportes', err);
        setError(err.message || 'No se pudo cargar el reporte');
      } finally {
        setLoading(false);
      }
    }
    cargarReporte();
  }, []);

  const handleImprimir = () => {
    window.print();
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500 text-xs">Cargando reporte consolidado...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-rose-600 text-xs">{error}</div>;
  }

  return (
    <>
      <style jsx global>{`
        @media print {
          body, html {
            background-color: white !important;
            color: black !important;
            height: auto !important;
          }
          .no-print {
            display: none !important;
          }
          .print-container {
            display: block !important;
            width: 100% !important;
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          /* Forzar visibilidad de tarjetas y cajas internas al imprimir */
          div, span, p, h1, h2, h3 {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>

      <div className="print-container p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto bg-slate-50 min-h-screen">
        
        {/* HEADER DEL NAVBAR (Se oculta al imprimir gracias a no-print) */}
        <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <Link href="/VistaPersonal" className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl transition text-slate-700">
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Reportes Gerenciales y Operativos • Hotel Princes Ica
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1 ml-10">
              Resumen consolidado de ingresos financieros, estado de ocupación hotelera y control de inventario.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleImprimir}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs transition shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4 text-amber-400" /> Exportar / Imprimir Reporte
            </button>
          </div>
        </div>

        {/* Cabecera para la impresion(Aparece solo al imprimir) */}
        <div className="hidden print:block mb-6 border-b border-slate-300 pb-4">
          <h1 className="text-2xl font-black text-slate-900">Hotel Princes Ica • Reporte Gerencial</h1>
          <p className="text-xs text-slate-500 mt-1">Fecha de emisión: {new Date().toLocaleString()}</p>
        </div>

       {/*Tarjetas de resumen*/}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Ingresos Acumulados</span>
              <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl"><DollarSign className="w-4 h-4" /></span>
            </div>
            <div className="my-3">
              <span className="text-3xl font-black text-slate-900 font-mono">
                S/ {statsReporte.totalIngresos.toFixed(2)}
              </span>
            </div>
            <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> Caja operativa activa
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tasa de Ocupación</span>
              <span className="p-2 bg-amber-50 text-amber-600 rounded-xl"><BedDouble className="w-4 h-4" /></span>
            </div>
            <div className="my-3">
              <span className="text-3xl font-black text-slate-900 font-mono">
                {statsReporte.porcentajeOcupacion}%
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              {statsReporte.habitacionesOcupadas} de {statsReporte.totalHabitaciones} habitaciones ocupadas
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Estadías Registradas</span>
              <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl"><BarChart3 className="w-4 h-4" /></span>
            </div>
            <div className="my-3">
              <span className="text-3xl font-black text-slate-900 font-mono">
                {statsReporte.totalCheckIns}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">Huéspedes atendidos en sistema</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Alertas de Almacén</span>
              <span className="p-2 bg-rose-50 text-rose-600 rounded-xl"><Package className="w-4 h-4" /></span>
            </div>
            <div className="my-3">
              <span className="text-3xl font-black text-rose-600 font-mono">
                {statsReporte.insumosBajoStock}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">Ítems con stock por debajo del mínimo</p>
          </div>

        </div>

        {/* SEeccion de detalle*/}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-600" /> Desglose de Ingresos por Método de Pago
              </h3>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-xs font-semibold text-slate-700">Efectivo Físico (Caja)</span>
                <span className="text-sm font-black text-slate-900 font-mono">S/ {statsReporte.efectivoTotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-xs font-semibold text-slate-700">Billeteras Digitales & Tarjetas (POS / Yape)</span>
                <span className="text-sm font-black text-indigo-600 font-mono">S/ {statsReporte.digitalTotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 text-white">
                <span className="text-xs font-bold text-amber-400">Total Consolidado</span>
                <span className="text-base font-black font-mono">S/ {statsReporte.totalIngresos.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Package className="w-4 h-4 text-amber-600" /> Estado del Inventario de Insumos
              </h3>
              <span className="text-xs text-slate-500">{listaInsumos.length} ítems</span>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {listaInsumos.length > 0 ? (
                listaInsumos.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                    <div>
                      <span className="font-bold text-slate-900 block">{item.nombre}</span>
                      <span className="text-[10px] text-slate-400">{item.categoria}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-slate-800">{item.stock} {item.unidad}</span>
                      {item.stock <= item.stockMinimo && (
                        <span className="block text-[9px] text-rose-600 font-bold">¡Stock Bajo!</span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 text-center py-4">No hay insumos registrados en almacén.</p>
              )}
            </div>
          </div>

        </div>

      </div>
    </>
  );
}