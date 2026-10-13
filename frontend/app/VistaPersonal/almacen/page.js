'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Package,
  Search,
  AlertTriangle,
  CheckCircle2,
  ArrowLeft,
  Layers,
  RefreshCw,
  ShoppingCart
} from 'lucide-react';

export default function AlmacenPage() {
  const [busqueda, setBusqueda] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('TODOS');
  const [mensajeToast, setMensajeToast] = useState(null);
  const [insumos, setInsumos] = useState([]);

  const cargarAlmacenYConsumos = () => {
    try {
      if (typeof window !== 'undefined') {
        let inventarioBase = JSON.parse(localStorage.getItem('hotel_almacen')) || [
          { id: 1, codigo: 'INS-001', nombre: 'Toallas de Cuerpo Blancas', categoria: 'Limpieza / Ropa', stock: 42, stockMinimo: 15, unidad: 'Unidades', costoUnitario: 25.00 },
          { id: 2, codigo: 'INS-002', nombre: 'Sábanas King Size', categoria: 'Limpieza / Ropa', stock: 12, stockMinimo: 10, unidad: 'Unidades', costoUnitario: 45.00 },
          { id: 3, codigo: 'INS-003', nombre: 'Papel Higiénico (Pack x 4)', categoria: 'Limpieza', stock: 8, stockMinimo: 20, unidad: 'Packs', costoUnitario: 12.00 },
          { id: 4, codigo: 'INS-004', nombre: 'Agua Mineral Sin Gas 600ml', categoria: 'Bar / Minibar', stock: 65, stockMinimo: 30, unidad: 'Botellas', costoUnitario: 2.50 },
          { id: 5, codigo: 'INS-005', nombre: 'Cerveza Cusqueña 330ml', categoria: 'Bar / Minibar', stock: 24, stockMinimo: 15, unidad: 'Botellas', costoUnitario: 6.00 },
          { id: 6, codigo: 'INS-006', nombre: 'Snack Piqueo Frito Lay', categoria: 'Bar / Minibar', stock: 5, stockMinimo: 12, unidad: 'Bolsas', costoUnitario: 3.50 },
          { id: 7, codigo: 'INS-007', nombre: 'Jabón Líquido / Shampoos Sachets', categoria: 'Limpieza', stock: 110, stockMinimo: 40, unidad: 'Unidades', costoUnitario: 0.80 },
        ];

        const estadiasGuardadas = JSON.parse(localStorage.getItem('hotel_estadias')) || [];
        const consumosTotales = {};
        
        estadiasGuardadas.forEach(estadia => {
          const listaConsumos = estadia.consumos || [];
          listaConsumos.forEach(con => {
            const nombreProd = (con.nombreServicio || '').toLowerCase();
            const cantidad = Number(con.cantidad || 1);
            
            inventarioBase.forEach(item => {
              if (nombreProd.includes(item.nombre.toLowerCase()) || item.nombre.toLowerCase().includes(nombreProd)) {
                consumosTotales[item.id] = (consumosTotales[item.id] || 0) + cantidad;
              }
            });
          });
        });

        const inventarioActualizado = inventarioBase.map(item => {
          const gastadoPorHuespedes = consumosTotales[item.id] || 0;
          const stockReal = Math.max(0, item.stock - gastadoPorHuespedes);
          return {
            ...item,
            stock: stockReal,
            consumidoPorHuespedes: gastadoPorHuespedes
          };
        });

        setInsumos(inventarioActualizado);
        localStorage.setItem('hotel_almacen', JSON.stringify(inventarioActualizado));
      }
    } catch (err) {
      console.error('Error al sincronizar almacén con consumos', err);
    }
  };

  useEffect(() => {
    cargarAlmacenYConsumos();
  }, []);

  const mostrarAlerta = (texto) => {
    setMensajeToast(texto);
    setTimeout(() => setMensajeToast(null), 3000);
  };

  const handleRecargarStock = (id) => {
    const actualizado = insumos.map(item => {
      if (item.id === id) {
        return { ...item, stock: item.stock + 20 };
      }
      return item;
    });
    setInsumos(actualizado);
    localStorage.setItem('hotel_almacen', JSON.stringify(actualizado));
    mostrarAlerta('Stock abastecido correctamente (+20 unidades)');
  };

  const insumosFiltrados = insumos.filter(item => {
    const matchBusqueda = item.nombre.toLowerCase().includes(busqueda.toLowerCase()) || 
                          item.codigo.toLowerCase().includes(busqueda.toLowerCase());
    const matchCat = filtroCategoria === 'TODOS' || item.categoria.toLowerCase().includes(filtroCategoria.toLowerCase());
    return matchBusqueda && matchCat;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto relative">
      
      {mensajeToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-bold animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          {mensajeToast}
        </div>
      )}

      {/* Header sin etiqueta de rol */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/VistaPersonal" className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl transition text-slate-700">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Control de Almacén e Insumos • Hotel Princes Ica
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1 ml-10">
            Inventario sincronizado automáticamente con los consumos de minibar y artículos de limpieza de los huéspedes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={cargarAlmacenYConsumos}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
            title="Sincronizar stock y consumos"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Ítems en Catálogo</span>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{insumos.length}</h3>
          </div>
          <span className="p-3 bg-slate-100 text-slate-700 rounded-2xl"><Layers className="w-5 h-5" /></span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Alertas de Stock Bajo</span>
            <h3 className="text-2xl font-black text-rose-600 mt-1">
              {insumos.filter(i => i.stock <= i.stockMinimo).length}
            </h3>
          </div>
          <span className="p-3 bg-rose-50 text-rose-600 rounded-2xl"><AlertTriangle className="w-5 h-5" /></span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Descontado por Huéspedes</span>
            <h3 className="text-2xl font-black text-indigo-600 mt-1">
              {insumos.reduce((acc, curr) => acc + (curr.consumidoPorHuespedes || 0), 0)} unidades
            </h3>
          </div>
          <span className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl"><ShoppingCart className="w-5 h-5" /></span>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nombre o código (ej. Toallas, Agua)..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-amber-500 transition"
          />
        </div>

        <select
          value={filtroCategoria}
          onChange={(e) => setFiltroCategoria(e.target.value)}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-amber-500"
        >
          <option value="TODOS">Todas las Categorías</option>
          <option value="Limpieza">Limpieza / Ropa</option>
          <option value="Bar">Bar / Minibar</option>
        </select>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Inventario Sincronizado</h3>
          <span className="text-xs text-slate-500">Se actualiza al registrar consumos de habitaciones</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <th className="p-4">Código</th>
                <th className="p-4">Insumo / Producto</th>
                <th className="p-4">Categoría</th>
                <th className="p-4">Stock Actual</th>
                <th className="p-4">Consumido (Huéspedes)</th>
                <th className="p-4">Costo Unit.</th>
                <th className="p-4 text-center">Estado</th>
                <th className="p-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {insumosFiltrados.length > 0 ? (
                insumosFiltrados.map((item) => {
                  const stockBajo = item.stock <= item.stockMinimo;
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-4 font-mono font-bold text-slate-900">{item.codigo}</td>
                      <td className="p-4 font-semibold text-slate-900">{item.nombre}</td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg font-medium text-[11px]">
                          {item.categoria}
                        </span>
                      </td>
                      <td className="p-4 font-mono font-bold text-sm">
                        {item.stock} <span className="text-[10px] font-normal text-slate-400">{item.unidad}</span>
                      </td>
                      <td className="p-4 font-mono text-indigo-600 font-bold">
                        -{item.consumidoPorHuespedes || 0}
                      </td>
                      <td className="p-4 font-mono font-semibold">S/ {item.costoUnitario.toFixed(2)}</td>
                      <td className="p-4 text-center">
                        {stockBajo ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-full font-bold text-[10px]">
                            <AlertTriangle className="w-3 h-3" /> Stock Bajo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full font-bold text-[10px]">
                            <CheckCircle2 className="w-3 h-3" /> Óptimo
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleRecargarStock(item.id)}
                          className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl transition shadow-xs text-[11px]"
                        >
                          + Abastecer
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" className="p-10 text-center text-slate-500">
                    No se encontraron insumos en el almacén.
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