'use client';

import React, { useState, useEffect } from 'react';
import {
  BellRing,
  Plus,
  Search,
  BedDouble,
  User,
  ShoppingBag,
  CreditCard,
  LogOut,
  Calendar,
  DollarSign,
  Receipt,
  FileText,
  Clock,
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { EstadiaAPI, HabitacionAPI, HuespedAPI, ReservacionAPI } from '../../../lib/api';
import { ModalCheckIn, ModalConsumo, ModalPago, ModalCheckOut } from '../../components/ModalesRecepcion';
import ComprobanteModal from '../../components/ComprobanteModal';
import { useToast } from '../../components/Toast';

export default function RecepcionPage() {
  const { addToast } = useToast();
  const [estadias, setEstadias] = useState([]);
  const [habitaciones, setHabitaciones] = useState([]);
  const [huespedes, setHuespedes] = useState([]);
  const [reservaciones, setReservaciones] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('ACTIVA'); // 'ACTIVA' | 'TODAS'
  const [loading, setLoading] = useState(true);

  // Modales
  const [modalCheckInOpen, setModalCheckInOpen] = useState(false);
  const [estadiaSeleccionada, setEstadiaSeleccionada] = useState(null);
  const [modalConsumoOpen, setModalConsumoOpen] = useState(false);
  const [modalPagoOpen, setModalPagoOpen] = useState(false);
  const [modalCheckOutOpen, setModalCheckOutOpen] = useState(false);
  const [comprobanteData, setComprobanteData] = useState(null);
  const [comprobanteOpen, setComprobanteOpen] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [e, h, hu, r] = await Promise.all([
        EstadiaAPI.getAll(filtroEstado === 'ACTIVA'),
        HabitacionAPI.getAll(),
        HuespedAPI.getAll(),
        ReservacionAPI.getAll()
      ]);
      setEstadias(e || []);
      setHabitaciones(h || []);
      setHuespedes(hu || []);
      setReservaciones(r || []);
    } catch (err) {
      console.error('Error cargando recepción', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filtroEstado]);

  const handleCheckInSuccess = async (payload) => {
    await EstadiaAPI.checkIn(payload);
    loadData();
  };

  const handleConsumoSuccess = async (estadiaId, consumoData) => {
    await EstadiaAPI.agregarConsumo(estadiaId, consumoData);
    loadData();
  };

  const handlePagoSuccess = async (estadiaId, pagoData) => {
    await EstadiaAPI.registrarPago(estadiaId, pagoData);
    loadData();
  };

  const handleCheckOutConfirm = async (estadiaId, checkOutData) => {
    const res = await EstadiaAPI.checkOut(estadiaId, checkOutData);
    loadData();
    return res;
  };

  const handleCheckOutFinished = (resData) => {
    setModalCheckOutOpen(false);
    if (resData) {
      setComprobanteData(resData);
      setComprobanteOpen(true);
    }
  };

  // Filtrado
  const estadiasFiltradas = estadias.filter((e) => {
    if (!busqueda) return true;
    const q = busqueda.toLowerCase();
    const nombre = `${e.huesped?.nombres || ''} ${e.huesped?.apellidos || ''}`.toLowerCase();
    const doc = e.huesped?.numeroDocumento || '';
    const hab = e.habitacion?.numero || '';
    const cod = (e.codigoReserva || '').toLowerCase();
    return nombre.includes(q) || doc.includes(q) || hab.includes(q) || cod.includes(q);
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-amber-500/10 text-amber-600 rounded-xl">
              <BellRing className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Módulo de Recepción & Estadías
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Control de registros de check-in, cargos por habitación, abonos y liquidación de salidas.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setModalCheckInOpen(true)}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs transition shadow-md flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Registrar Check-In
        </button>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-4 rounded-2xl border border-slate-200">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por Huésped, DNI o N° Hab..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setFiltroEstado('ACTIVA')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              filtroEstado === 'ACTIVA'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Solo Estadías Activas ({estadias.filter(e => e.estado === 'ACTIVA').length})
          </button>
          <button
            onClick={() => setFiltroEstado('TODAS')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              filtroEstado === 'TODAS'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Historial Completo
          </button>
        </div>
      </div>

      {/* Lista de Estadías */}
      {estadiasFiltradas.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <BedDouble className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h4 className="text-sm font-bold text-slate-700">No se encontraron estadías</h4>
          <p className="text-xs text-slate-400 mt-1">Registra un nuevo check-in o ajusta los filtros de búsqueda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {estadiasFiltradas.map((estadia) => {
            const saldo = Number(estadia.saldoPendiente || 0);
            const isActiva = estadia.estado === 'ACTIVA';

            return (
              <div
                key={estadia.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition flex flex-col lg:flex-row justify-between gap-6"
              >
                {/* Info Izquierda: Habitación y Huésped */}
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-slate-900 text-amber-400 flex flex-col items-center justify-center font-black border border-slate-800 shrink-0">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Hab</span>
                    <span className="text-xl leading-none">{estadia.habitacion?.numero}</span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base text-slate-900">
                        {estadia.huesped?.nombres} {estadia.huesped?.apellidos}
                      </h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        isActiva
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>
                        {isActiva ? 'En Hospedaje' : 'Finalizada'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 flex items-center gap-2">
                      <span>{estadia.huesped?.tipoDocumento}: <strong>{estadia.huesped?.numeroDocumento}</strong></span>
                      <span>•</span>
                      <span>Tel: {estadia.huesped?.telefono || 'No registrado'}</span>
                      <span>•</span>
                      <span>{estadia.huesped?.ciudadProcedencia || 'Ica'}</span>
                    </p>

                    <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-600">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        Ingreso: <strong className="text-slate-800">{new Date(estadia.fechaIngreso).toLocaleDateString('es-PE')}</strong>
                      </span>
                      <span>—</span>
                      <span className="flex items-center gap-1">
                        Salida Prevista: <strong className="text-slate-800">{estadia.fechaSalidaEsperada}</strong>
                      </span>
                      <span className="text-[11px] px-2 py-0.5 bg-slate-100 rounded text-slate-600 font-mono">
                        {estadia.codigoReserva || 'DIRECTO'}
                      </span>
                    </div>

                    {estadia.observaciones && (
                      <p className="text-[11px] text-amber-700 bg-amber-50 p-1.5 rounded-lg border border-amber-200 mt-2">
                        📝 {estadia.observaciones}
                      </p>
                    )}
                  </div>
                </div>

                {/* Info Derecha: Cuentas y Botones Operativos */}
                <div className="flex flex-col sm:flex-row items-end justify-between lg:justify-end gap-4 border-t lg:border-t-0 pt-4 lg:pt-0 border-slate-100">
                  {/* Desglose Económico */}
                  <div className="w-full sm:w-auto text-left sm:text-right space-y-1 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="flex justify-between sm:justify-end gap-3 text-slate-500">
                      <span>Hospedaje:</span>
                      <span className="font-mono font-medium text-slate-800">S/ {Number(estadia.totalHospedaje || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between sm:justify-end gap-3 text-slate-500">
                      <span>Consumos ({estadia.consumos?.length || 0}):</span>
                      <span className="font-mono font-medium text-slate-800">S/ {Number(estadia.totalConsumos || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between sm:justify-end gap-3 text-slate-500">
                      <span>Abonado:</span>
                      <span className="font-mono font-medium text-emerald-600">S/ {Number(estadia.totalPagado || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between sm:justify-end gap-3 text-sm font-bold border-t border-slate-200 pt-1 text-slate-900">
                      <span>Saldo:</span>
                      <span className={`font-mono ${saldo > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                        S/ {saldo.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Botones de Acción */}
                  {isActiva && (
                    <div className="flex flex-wrap sm:flex-col gap-2 w-full sm:w-auto shrink-0">
                      <button
                        onClick={() => {
                          setEstadiaSeleccionada(estadia);
                          setModalConsumoOpen(true);
                        }}
                        className="flex-1 sm:flex-none px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5 border border-slate-200"
                      >
                        <ShoppingBag className="w-3.5 h-3.5 text-amber-600" /> + Cargar Consumo
                      </button>

                      <button
                        onClick={() => {
                          setEstadiaSeleccionada(estadia);
                          setModalPagoOpen(true);
                        }}
                        className="flex-1 sm:flex-none px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5 border border-emerald-200"
                      >
                        <CreditCard className="w-3.5 h-3.5 text-emerald-600" /> Registrar Abono
                      </button>

                      <button
                        onClick={() => {
                          setEstadiaSeleccionada(estadia);
                          setModalCheckOutOpen(true);
                        }}
                        className="flex-1 sm:flex-none px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <LogOut className="w-3.5 h-3.5 text-rose-200" /> Check-Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modales */}
      <ModalCheckIn
        isOpen={modalCheckInOpen}
        onClose={() => setModalCheckInOpen(false)}
        onSuccess={handleCheckInSuccess}
        habitaciones={habitaciones}
        huespedes={huespedes}
        reservaciones={reservaciones}
      />

      <ModalConsumo
        isOpen={modalConsumoOpen}
        onClose={() => setModalConsumoOpen(false)}
        onSuccess={handleConsumoSuccess}
        estadia={estadiaSeleccionada}
      />

      <ModalPago
        isOpen={modalPagoOpen}
        onClose={() => setModalPagoOpen(false)}
        onSuccess={handlePagoSuccess}
        estadia={estadiaSeleccionada}
      />

      <ModalCheckOut
        isOpen={modalCheckOutOpen}
        onClose={handleCheckOutFinished}
        onConfirmCheckOut={handleCheckOutConfirm}
        estadia={estadiaSeleccionada}
      />

      <ComprobanteModal
        isOpen={comprobanteOpen}
        onClose={() => setComprobanteOpen(false)}
        data={comprobanteData}
      />
    </div>
  );
}
