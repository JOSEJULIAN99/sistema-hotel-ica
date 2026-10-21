// API Client para el Sistema Hotel Princes Ica
// Se conecta al backend Spring Boot en NEXT_PUBLIC_API_URL (por defecto http://localhost:8080/api).
//
// Regla de errores:
// - Si el servidor responde con error (400, 401, 403, 404, 500), el error se muestra al usuario tal cual.
// - Los datos locales de demostración solo se usan si NEXT_PUBLIC_MODO_DEMO=true
//   y el servidor no responde (caída de red o timeout). Nunca se simula un éxito.

import {
  INITIAL_HABITACIONES,
  INITIAL_HUESPEDES,
  INITIAL_RESERVACIONES,
  INITIAL_ESTADIAS,
  INITIAL_USUARIOS,
  INITIAL_LIMPIEZA
} from './mockData';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
const MODO_DEMO = process.env.NEXT_PUBLIC_MODO_DEMO === 'true';

// Error con el código HTTP y el mensaje que envió el servidor
export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

// ¿Se puede usar el almacén local? Solo en modo demo y si el servidor no respondió.
function puedeUsarDemo(err) {
  return MODO_DEMO && !(err instanceof ApiError);
}

// Token JWT guardado al iniciar sesión (ver lib/auth.js)
function getAuthHeader() {
  if (typeof window === 'undefined') return {};
  try {
    const token = localStorage.getItem('hotel_session_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch (e) {
    return {};
  }
}

// Helper para sincronizar datos locales en navegador
function getLocalStore(key, defaultVal) {
  if (typeof window === 'undefined') return defaultVal;
  try {
    const saved = localStorage.getItem(`hotel_${key}`);
    if (saved) return JSON.parse(saved);
    localStorage.setItem(`hotel_${key}`, JSON.stringify(defaultVal));
    return defaultVal;
  } catch (e) {
    return defaultVal;
  }
}

function setLocalStore(key, val) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`hotel_${key}`, JSON.stringify(val));
  } catch (e) {
    console.error('Error saving local store', e);
  }
}

// Cliente HTTP Genérico con Timeout
async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...getAuthHeader(),
      ...options.headers,
    },
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 s
  let res;
  try {
    res = await fetch(url, { ...config, signal: controller.signal });
  } catch (err) {
    clearTimeout(timeoutId);
    // Caída de red, servidor apagado o timeout
    const sinServidor = new Error('No se pudo conectar con el servidor. Verifique que el backend esté en ejecución.');
    sinServidor.cause = err;
    throw sinServidor;
  }
  clearTimeout(timeoutId);

  if (res.status === 401 && typeof window !== 'undefined') {
    // Sesión vencida o inválida: volver al login
    localStorage.removeItem('hotel_session_user');
    localStorage.removeItem('hotel_session_token');
    if (!window.location.pathname.endsWith('/login') && window.location.pathname.startsWith('/VistaPersonal')) {
      window.location.href = '/VistaPersonal/login';
    }
  }

  if (!res.ok) {
    const errJson = await res.json().catch(() => ({}));
    const detalle = errJson.errors ? Object.values(errJson.errors).join('. ') : null;
    throw new ApiError(detalle || errJson.message || `Error HTTP: ${res.status}`, res.status);
  }

  if (res.status === 204) return null;
  const data = await res.json().catch(() => null);
  if (data === null) return null;
  return data.data !== undefined ? data.data : data;
}

// Envío de archivos (multipart). No fija Content-Type: el navegador agrega el boundary.
async function requestArchivo(endpoint, formData, method = 'POST') {
  let res;
  try {
    res = await fetch(`${BASE_URL}${endpoint}`, { method, body: formData, headers: { ...getAuthHeader() } });
  } catch (err) {
    throw new Error('No se pudo conectar con el servidor. Verifique que el backend esté en ejecución.');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(data.message || `Error HTTP: ${res.status}`, res.status);
  return data.data !== undefined ? data.data : data;
}

// ==================== DASHBOARD ====================
export const DashboardAPI = {
  async getStats() {
    try {
      return await request('/dashboard');
    } catch (err) {
      if (!puedeUsarDemo(err)) throw err;
      const habitaciones = getLocalStore('habitaciones', INITIAL_HABITACIONES);
      const estadias = getLocalStore('estadias', INITIAL_ESTADIAS);
      const reservaciones = getLocalStore('reservaciones', INITIAL_RESERVACIONES);
      const limpieza = getLocalStore('limpieza', INITIAL_LIMPIEZA);

      const totalHab = habitaciones.length;
      const disponibles = habitaciones.filter(h => h.estado === 'DISPONIBLE').length;
      const ocupadas = habitaciones.filter(h => h.estado === 'OCUPADA').length;
      const enLimpieza = habitaciones.filter(h => h.estado === 'LIMPIEZA').length;
      const enMant = habitaciones.filter(h => h.estado === 'MANTENIMIENTO').length;
      const reservadas = habitaciones.filter(h => h.estado === 'RESERVADA').length;
      const pctOcupacion = totalHab > 0 ? ((ocupadas / totalHab) * 100).toFixed(1) : 0;

      const actEstadias = estadias.filter(e => e.estado === 'ACTIVA');
      const tareasPendientes = limpieza.filter(t => t.estado === 'PENDIENTE' || t.estado === 'EN_PROCESO');
      const resPendientes = reservaciones.filter(r => r.estado === 'PENDIENTE' || r.estado === 'CONFIRMADA');

      let ingresosHoy = 0;
      estadias.forEach(e => {
        (e.pagos || []).forEach(p => {
          ingresosHoy += Number(p.monto || 0);
        });
      });

      return {
        totalHabitaciones: totalHab,
        habitacionesDisponibles: disponibles,
        habitacionesOcupadas: ocupadas,
        habitacionesEnLimpieza: enLimpieza,
        habitacionesEnMantenimiento: enMant,
        habitacionesReservadas: reservadas,
        porcentajeOcupacion: Number(pctOcupacion),
        checkInsHoy: actEstadias.length,
        checkOutsHoy: 0,
        estadiasActivas: actEstadias.length,
        reservacionesPendientes: resPendientes.length,
        tareasLimpiezaPendientes: tareasPendientes.length,
        ingresosHoy,
        ingresosMes: ingresosHoy
      };
    }
  }
};

// ==================== HABITACIONES ====================
export const HabitacionAPI = {
  async getAll(params = {}) {
    try {
      const query = new URLSearchParams(params).toString();
      return await request(`/habitaciones${query ? '?' + query : ''}`);
    } catch (err) {
      if (!puedeUsarDemo(err)) throw err;
      let list = getLocalStore('habitaciones', INITIAL_HABITACIONES);
      if (params.estado) list = list.filter(h => h.estado === params.estado);
      if (params.tipo) list = list.filter(h => h.tipo === params.tipo);
      if (params.piso) list = list.filter(h => String(h.piso) === String(params.piso));
      return list;
    }
  },

  async getById(id) {
    try {
      return await request(`/habitaciones/${id}`);
    } catch (err) {
      if (!puedeUsarDemo(err)) throw err;
      const list = getLocalStore('habitaciones', INITIAL_HABITACIONES);
      return list.find(h => String(h.id) === String(id));
    }
  },

  async create(data) {
    try {
      return await request('/habitaciones', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (err) {
      if (!puedeUsarDemo(err)) throw err;
      const list = getLocalStore('habitaciones', INITIAL_HABITACIONES);
      const nueva = {
        ...data,
        id: Date.now(),
        precioPorNoche: Number(data.precioPorNoche),
        capacidad: Number(data.capacidad),
        piso: Number(data.piso),
        estado: data.estado || 'DISPONIBLE'
      };
      list.push(nueva);
      setLocalStore('habitaciones', list);
      return nueva;
    }
  },

  async update(id, data) {
    try {
      return await request(`/habitaciones/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    } catch (err) {
      if (!puedeUsarDemo(err)) throw err;
      const list = getLocalStore('habitaciones', INITIAL_HABITACIONES);
      const index = list.findIndex(h => String(h.id) === String(id));
      if (index !== -1) {
        list[index] = { ...list[index], ...data, id: Number(id) };
        setLocalStore('habitaciones', list);
        return list[index];
      }
      return data;
    }
  },

  // Foto de la habitación: se guarda en Supabase Storage (o disco del servidor) y se ve en toda la web
  async subirImagen(id, archivo) {
    const formData = new FormData();
    formData.append('archivo', archivo);
    return await requestArchivo(`/habitaciones/${id}/imagen`, formData);
  },

  async eliminarImagen(id) {
    return await request(`/habitaciones/${id}/imagen`, { method: 'DELETE' });
  },

  async updateEstado(id, nuevoEstado) {
    try {
      return await request(`/habitaciones/${id}/estado?estado=${nuevoEstado}`, {
        method: 'PATCH',
      });
    } catch (err) {
      if (!puedeUsarDemo(err)) throw err;
      const list = getLocalStore('habitaciones', INITIAL_HABITACIONES);
      const index = list.findIndex(h => String(h.id) === String(id));
      if (index !== -1) {
        list[index].estado = nuevoEstado;
        setLocalStore('habitaciones', list);
        return list[index];
      }
    }
  },

  async delete(id) {
    try {
      return await request(`/habitaciones/${id}`, { method: 'DELETE' });
    } catch (err) {
      if (!puedeUsarDemo(err)) throw err;
      let list = getLocalStore('habitaciones', INITIAL_HABITACIONES);
      list = list.filter(h => String(h.id) !== String(id));
      setLocalStore('habitaciones', list);
      return { success: true };
    }
  }
};

// ==================== HUESPEDES ====================
export const HuespedAPI = {
  async getAll(search = '') {
    try {
      return await request(`/huespedes${search ? `?search=${encodeURIComponent(search)}` : ''}`);
    } catch (err) {
      if (!puedeUsarDemo(err)) throw err;
      let list = getLocalStore('huespedes', INITIAL_HUESPEDES);
      if (search) {
        const q = search.toLowerCase();
        list = list.filter(h => 
          (h.nombres && h.nombres.toLowerCase().includes(q)) ||
          (h.apellidos && h.apellidos.toLowerCase().includes(q)) ||
          (h.numeroDocumento && h.numeroDocumento.includes(q))
        );
      }
      return list;
    }
  },

  async create(data) {
    try {
      return await request('/huespedes', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (err) {
      if (!puedeUsarDemo(err)) throw err;
      const list = getLocalStore('huespedes', INITIAL_HUESPEDES);
      const nuevo = { ...data, id: Date.now() };
      list.push(nuevo);
      setLocalStore('huespedes', list);
      return nuevo;
    }
  },

  async update(id, data) {
    try {
      return await request(`/huespedes/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    } catch (err) {
      if (!puedeUsarDemo(err)) throw err;
      const list = getLocalStore('huespedes', INITIAL_HUESPEDES);
      const index = list.findIndex(h => String(h.id) === String(id));
      if (index !== -1) {
        list[index] = { ...list[index], ...data };
        setLocalStore('huespedes', list);
        return list[index];
      }
    }
  },

  async delete(id) {
    try {
      return await request(`/huespedes/${id}`, { method: 'DELETE' });
    } catch (err) {
      if (!puedeUsarDemo(err)) throw err;
      let list = getLocalStore('huespedes', INITIAL_HUESPEDES);
      list = list.filter(h => String(h.id) !== String(id));
      setLocalStore('huespedes', list);
      return { success: true };
    }
  }
};

// ==================== ESTADIAS / RECEPCION ====================
export const EstadiaAPI = {
  async getAll(soloActivas = false) {
    try {
      return await request(`/estadias?soloActivas=${soloActivas}`);
    } catch (err) {
      if (!puedeUsarDemo(err)) throw err;
      const list = getLocalStore('estadias', INITIAL_ESTADIAS);
      return soloActivas ? list.filter(e => e.estado === 'ACTIVA') : list;
    }
  },

  async getById(id) {
    try {
      return await request(`/estadias/${id}`);
    } catch (err) {
      if (!puedeUsarDemo(err)) throw err;
      const list = getLocalStore('estadias', INITIAL_ESTADIAS);
      return list.find(e => String(e.id) === String(id));
    }
  },

  async checkIn(data) {
    try {
      return await request('/estadias/check-in', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (err) {
      if (!puedeUsarDemo(err)) throw err;
      const estadias = getLocalStore('estadias', INITIAL_ESTADIAS);
      const habitaciones = getLocalStore('habitaciones', INITIAL_HABITACIONES);
      const huespedes = getLocalStore('huespedes', INITIAL_HUESPEDES);
      const reservaciones = getLocalStore('reservaciones', INITIAL_RESERVACIONES);

      let habitacion = habitaciones.find(h => String(h.id) === String(data.habitacionId));
      let huesped = huespedes.find(h => String(h.id) === String(data.huespedId));
      let codigoRes = `WALK-IN-${Date.now().toString().slice(-4)}`;

      // Si viene de reservación
      if (data.reservacionId) {
        const res = reservaciones.find(r => String(r.id) === String(data.reservacionId));
        if (res) {
          habitacion = res.habitacion;
          huesped = res.huesped;
          codigoRes = res.codigoReserva;
          res.estado = 'EN_CURSO';
          setLocalStore('reservaciones', reservaciones);
        }
      }

      // Marcar habitación como OCUPADA
      if (habitacion) {
        habitacion.estado = 'OCUPADA';
        setLocalStore('habitaciones', habitaciones);
      }

      const totalHosp = Number(data.totalHospedaje || (habitacion ? habitacion.precioPorNoche : 100));
      const pagoInicialMonto = Number(data.pagoInicial || 0);

      const pagos = [];
      if (pagoInicialMonto > 0) {
        pagos.push({
          id: Date.now(),
          monto: pagoInicialMonto,
          metodoPago: data.metodoPagoInicial || 'EFECTIVO',
          fechaPago: new Date().toISOString(),
          nroOperacion: data.nroOperacionInicial || `OP-${Date.now().toString().slice(-4)}`,
          tipoComprobante: 'BOLETA',
          notas: 'Abono inicial en Check-In'
        });
      }

      const nuevaEstadia = {
        id: Date.now(),
        reservacionId: data.reservacionId || null,
        codigoReserva: codigoRes,
        huesped,
        habitacion,
        fechaIngreso: new Date().toISOString(),
        fechaSalidaEsperada: data.fechaSalidaEsperada || new Date(Date.now() + 86400000).toISOString().split('T')[0],
        fechaSalidaReal: null,
        totalHospedaje: totalHosp,
        totalConsumos: 0.00,
        descuento: 0.00,
        totalPagar: totalHosp,
        totalPagado: pagoInicialMonto,
        saldoPendiente: totalHosp - pagoInicialMonto,
        estado: 'ACTIVA',
        observaciones: data.observaciones || '',
        consumos: [],
        pagos
      };

      estadias.unshift(nuevaEstadia);
      setLocalStore('estadias', estadias);
      return nuevaEstadia;
    }
  },

  async agregarConsumo(estadiaId, consumoData) {
    try {
      return await request(`/estadias/${estadiaId}/consumos`, {
        method: 'POST',
        body: JSON.stringify(consumoData),
      });
    } catch (err) {
      if (!puedeUsarDemo(err)) throw err;
      const list = getLocalStore('estadias', INITIAL_ESTADIAS);
      const estadia = list.find(e => String(e.id) === String(estadiaId));
      if (estadia) {
        if (!estadia.consumos) estadia.consumos = [];
        const cant = Number(consumoData.cantidad || 1);
        const pu = Number(consumoData.precioUnitario || 0);
        const subtotal = cant * pu;

        const nuevoConsumo = {
          id: Date.now(),
          estadiaId: Number(estadiaId),
          nombreServicio: consumoData.nombreServicio,
          cantidad: cant,
          precioUnitario: pu,
          subtotal,
          fechaConsumo: new Date().toISOString()
        };

        estadia.consumos.push(nuevoConsumo);
        estadia.totalConsumos = (Number(estadia.totalConsumos || 0) + subtotal);
        estadia.totalPagar = Number(estadia.totalHospedaje || 0) + Number(estadia.totalConsumos || 0) - Number(estadia.descuento || 0);
        estadia.saldoPendiente = Number(estadia.totalPagar || 0) - Number(estadia.totalPagado || 0);

        setLocalStore('estadias', list);
        return estadia;
      }
    }
  },

  async registrarPago(estadiaId, pagoData) {
    try {
      return await request(`/estadias/${estadiaId}/pagos`, {
        method: 'POST',
        body: JSON.stringify(pagoData),
      });
    } catch (err) {
      if (!puedeUsarDemo(err)) throw err;
      const list = getLocalStore('estadias', INITIAL_ESTADIAS);
      const estadia = list.find(e => String(e.id) === String(estadiaId));
      if (estadia) {
        if (!estadia.pagos) estadia.pagos = [];
        const monto = Number(pagoData.monto || 0);

        const nuevoPago = {
          id: Date.now(),
          estadiaId: Number(estadiaId),
          monto,
          metodoPago: pagoData.metodoPago,
          fechaPago: new Date().toISOString(),
          nroOperacion: pagoData.nroOperacion || `OP-${Date.now().toString().slice(-4)}`,
          tipoComprobante: pagoData.tipoComprobante || 'BOLETA',
          notas: pagoData.notas || ''
        };

        estadia.pagos.push(nuevoPago);
        estadia.totalPagado = Number(estadia.totalPagado || 0) + monto;
        estadia.saldoPendiente = Math.max(0, Number(estadia.totalPagar || 0) - Number(estadia.totalPagado || 0));

        setLocalStore('estadias', list);
        return estadia;
      }
    }
  },

  async checkOut(estadiaId, checkOutData = {}) {
    try {
      return await request(`/estadias/${estadiaId}/check-out`, {
        method: 'POST',
        body: JSON.stringify(checkOutData),
      });
    } catch (err) {
      if (!puedeUsarDemo(err)) throw err;
      const estadias = getLocalStore('estadias', INITIAL_ESTADIAS);
      const habitaciones = getLocalStore('habitaciones', INITIAL_HABITACIONES);
      const limpiezas = getLocalStore('limpieza', INITIAL_LIMPIEZA);

      const estadia = estadias.find(e => String(e.id) === String(estadiaId));
      if (!estadia) throw new Error('Estadía no encontrada');

      // Procesar pago final si se envía
      if (checkOutData.pagoFinal && Number(checkOutData.pagoFinal) > 0) {
        const montoFinal = Number(checkOutData.pagoFinal);
        estadia.pagos.push({
          id: Date.now(),
          estadiaId: Number(estadiaId),
          monto: montoFinal,
          metodoPago: checkOutData.metodoPagoFinal || 'EFECTIVO',
          fechaPago: new Date().toISOString(),
          nroOperacion: checkOutData.nroOperacionFinal || `OP-OUT-${Date.now().toString().slice(-4)}`,
          tipoComprobante: checkOutData.tipoComprobante || 'BOLETA',
          notas: 'Liquidación final de Check-Out'
        });
        estadia.totalPagado = Number(estadia.totalPagado || 0) + montoFinal;
        estadia.saldoPendiente = Math.max(0, Number(estadia.totalPagar || 0) - Number(estadia.totalPagado || 0));
      }

      estadia.estado = 'FINALIZADA';
      estadia.fechaSalidaReal = new Date().toISOString();

      // Cambiar habitación a LIMPIEZA
      if (estadia.habitacion) {
        const hab = habitaciones.find(h => String(h.id) === String(estadia.habitacion.id));
        if (hab) {
          hab.estado = 'LIMPIEZA';
          setLocalStore('habitaciones', habitaciones);

          // Crear tarea de limpieza automática
          limpiezas.unshift({
            id: Date.now(),
            habitacion: hab,
            empleadoAsignado: null,
            tipoLimpieza: 'CHECKOUT',
            estado: 'PENDIENTE',
            prioridad: 'ALTA',
            observaciones: `Check-out completado para huésped ${estadia.huesped ? estadia.huesped.nombres + ' ' + estadia.huesped.apellidos : ''}. Requiere desinfección y cambio de ropa de cama.`,
            fechaCreacion: new Date().toISOString(),
            fechaInicio: null,
            fechaFin: null
          });
          setLocalStore('limpieza', limpiezas);
        }
      }

      setLocalStore('estadias', estadias);

      return {
        estadiaId: estadia.id,
        habitacionNumero: estadia.habitacion?.numero || '',
        huespedNombre: estadia.huesped ? `${estadia.huesped.nombres} ${estadia.huesped.apellidos}` : 'Huésped',
        fechaIngreso: estadia.fechaIngreso,
        fechaSalidaReal: estadia.fechaSalidaReal,
        totalHospedaje: estadia.totalHospedaje,
        totalConsumos: estadia.totalConsumos,
        totalPagar: estadia.totalPagar,
        totalPagado: estadia.totalPagado,
        saldoFinal: estadia.saldoPendiente,
        estadoHabitacionActual: 'LIMPIEZA',
        mensaje: 'Check-out completado exitosamente. Se ha programado la limpieza de la habitación.'
      };
    }
  }
};

// ==================== RESERVACIONES ====================
export const ReservacionAPI = {
  async getAll(params = {}) {
    try {
      const query = new URLSearchParams(params).toString();
      return await request(`/reservaciones${query ? '?' + query : ''}`);
    } catch (err) {
      if (!puedeUsarDemo(err)) throw err;
      let list = getLocalStore('reservaciones', INITIAL_RESERVACIONES);
      if (params.estado) list = list.filter(r => r.estado === params.estado);
      return list;
    }
  },

  async create(data) {
    try {
      return await request('/reservaciones', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (err) {
      if (!puedeUsarDemo(err)) throw err;
      const list = getLocalStore('reservaciones', INITIAL_RESERVACIONES);
      const habitaciones = getLocalStore('habitaciones', INITIAL_HABITACIONES);
      const huespedes = getLocalStore('huespedes', INITIAL_HUESPEDES);

      const habitacion = habitaciones.find(h => String(h.id) === String(data.habitacionId));
      const huesped = huespedes.find(h => String(h.id) === String(data.huespedId));

      if (habitacion) {
        habitacion.estado = 'RESERVADA';
        setLocalStore('habitaciones', habitaciones);
      }

      const nuevaReserva = {
        id: Date.now(),
        codigoReserva: `RES-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`,
        huesped,
        habitacion,
        fechaEntrada: data.fechaEntrada,
        fechaSalida: data.fechaSalida,
        numeroPersonas: Number(data.numeroPersonas || 1),
        precioTotal: Number(data.precioTotal),
        adelanto: Number(data.adelanto || 0),
        estado: 'CONFIRMADA',
        observaciones: data.observaciones || ''
      };

      list.unshift(nuevaReserva);
      setLocalStore('reservaciones', list);
      return nuevaReserva;
    }
  },

  async confirmar(id) {
    try {
      return await request(`/reservaciones/${id}/confirmar`, { method: 'PATCH' });
    } catch (err) {
      if (!puedeUsarDemo(err)) throw err;
      const list = getLocalStore('reservaciones', INITIAL_RESERVACIONES);
      const r = list.find(res => String(res.id) === String(id));
      if (r) {
        r.estado = 'CONFIRMADA';
        setLocalStore('reservaciones', list);
        return r;
      }
    }
  },

  async cancelar(id, motivo = '') {
    try {
      return await request(`/reservaciones/${id}/cancelar?motivo=${encodeURIComponent(motivo)}`, { method: 'PATCH' });
    } catch (err) {
      if (!puedeUsarDemo(err)) throw err;
      const list = getLocalStore('reservaciones', INITIAL_RESERVACIONES);
      const habitaciones = getLocalStore('habitaciones', INITIAL_HABITACIONES);
      const r = list.find(res => String(res.id) === String(id));
      if (r) {
        r.estado = 'CANCELADA';
        r.observaciones = (r.observaciones ? r.observaciones + ' | ' : '') + `Cancelada: ${motivo}`;
        
        // Si la habitación estaba reservada, liberarla
        if (r.habitacion) {
          const hab = habitaciones.find(h => String(h.id) === String(r.habitacion.id));
          if (hab && hab.estado === 'RESERVADA') {
            hab.estado = 'DISPONIBLE';
            setLocalStore('habitaciones', habitaciones);
          }
        }

        setLocalStore('reservaciones', list);
        return r;
      }
    }
  },

  async delete(id) {
    try {
      return await request(`/reservaciones/${id}`, { method: 'DELETE' });
    } catch (err) {
      if (!puedeUsarDemo(err)) throw err;
      let list = getLocalStore('reservaciones', INITIAL_RESERVACIONES);
      list = list.filter(r => String(r.id) !== String(id));
      setLocalStore('reservaciones', list);
      return { success: true };
    }
  }
};

// ==================== LIMPIEZA ====================
export const LimpiezaAPI = {
  async getAll(soloPendientes = false) {
    try {
      return await request(`/limpieza?soloPendientes=${soloPendientes}`);
    } catch (err) {
      if (!puedeUsarDemo(err)) throw err;
      const list = getLocalStore('limpieza', INITIAL_LIMPIEZA);
      return soloPendientes ? list.filter(t => t.estado === 'PENDIENTE') : list;
    }
  },

  async create(data) {
    try {
      return await request('/limpieza', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (err) {
      if (!puedeUsarDemo(err)) throw err;
      const list = getLocalStore('limpieza', INITIAL_LIMPIEZA);
      const habitaciones = getLocalStore('habitaciones', INITIAL_HABITACIONES);
      const usuarios = getLocalStore('usuarios', INITIAL_USUARIOS);

      const habitacion = habitaciones.find(h => String(h.id) === String(data.habitacionId));
      const empleado = usuarios.find(u => String(u.id) === String(data.empleadoId));

      if (habitacion) {
        habitacion.estado = 'LIMPIEZA';
        setLocalStore('habitaciones', habitaciones);
      }

      const nuevaTarea = {
        id: Date.now(),
        habitacion,
        empleadoAsignado: empleado || null,
        tipoLimpieza: data.tipoLimpieza || 'RUTINARIA',
        estado: 'PENDIENTE',
        prioridad: data.prioridad || 'MEDIA',
        observaciones: data.observaciones || '',
        fechaCreacion: new Date().toISOString(),
        fechaInicio: null,
        fechaFin: null
      };

      list.unshift(nuevaTarea);
      setLocalStore('limpieza', list);
      return nuevaTarea;
    }
  },

  async asignarEmpleado(id, empleadoId) {
    try {
      return await request(`/limpieza/${id}/asignar?empleadoId=${empleadoId}`, { method: 'PATCH' });
    } catch (err) {
      if (!puedeUsarDemo(err)) throw err;
      const list = getLocalStore('limpieza', INITIAL_LIMPIEZA);
      const usuarios = getLocalStore('usuarios', INITIAL_USUARIOS);
      const tarea = list.find(t => String(t.id) === String(id));
      const empleado = usuarios.find(u => String(u.id) === String(empleadoId));
      if (tarea) {
        tarea.empleadoAsignado = empleado;
        setLocalStore('limpieza', list);
        return tarea;
      }
    }
  },

  async iniciar(id) {
    try {
      return await request(`/limpieza/${id}/iniciar`, { method: 'PATCH' });
    } catch (err) {
      if (!puedeUsarDemo(err)) throw err;
      const list = getLocalStore('limpieza', INITIAL_LIMPIEZA);
      const tarea = list.find(t => String(t.id) === String(id));
      if (tarea) {
        tarea.estado = 'EN_PROCESO';
        tarea.fechaInicio = new Date().toISOString();
        setLocalStore('limpieza', list);
        return tarea;
      }
    }
  },

  async completar(id) {
    try {
      return await request(`/limpieza/${id}/completar`, { method: 'PATCH' });
    } catch (err) {
      if (!puedeUsarDemo(err)) throw err;
      const list = getLocalStore('limpieza', INITIAL_LIMPIEZA);
      const habitaciones = getLocalStore('habitaciones', INITIAL_HABITACIONES);
      const tarea = list.find(t => String(t.id) === String(id));
      if (tarea) {
        tarea.estado = 'COMPLETADA';
        tarea.fechaFin = new Date().toISOString();

        // Liberar habitación a DISPONIBLE
        if (tarea.habitacion) {
          const hab = habitaciones.find(h => String(h.id) === String(tarea.habitacion.id));
          if (hab) {
            hab.estado = 'DISPONIBLE';
            setLocalStore('habitaciones', habitaciones);
          }
        }

        setLocalStore('limpieza', list);
        return tarea;
      }
    }
  }
};

// ==================== USUARIOS / PERSONAL ====================
export const UsuarioAPI = {
  async getAll(rol) {
    try {
      return await request(`/usuarios${rol ? `?rol=${rol}` : ''}`);
    } catch (err) {
      if (!puedeUsarDemo(err)) throw err;
      let list = getLocalStore('usuarios', INITIAL_USUARIOS);
      if (rol) list = list.filter(u => u.rol === rol);
      return list;
    }
  },

  // Alta de personal (solo administrador)
  async create(datos) {
    return await request('/usuarios', { method: 'POST', body: JSON.stringify(datos) });
  },

  async update(id, datos) {
    return await request(`/usuarios/${id}`, { method: 'PUT', body: JSON.stringify(datos) });
  },

  async cambiarActivo(id, activo) {
    return await request(`/usuarios/${id}/activo?valor=${activo ? 'true' : 'false'}`, { method: 'PATCH' });
  },

  async restablecerPassword(id, password) {
    return await request(`/usuarios/${id}/password`, { method: 'PATCH', body: JSON.stringify({ password }) });
  }
};
// ==================== ASISTENTE IA ====================
// Sugiere; nunca ejecuta operaciones. Sin modo demo: requiere el backend.
export const AsistenteAPI = {
  async estado() {
    return await request('/asistente/estado');
  },

  async recomendar({ fechaEntrada, fechaSalida, numeroPersonas, presupuestoPorNoche, preferencias }) {
    return await request('/asistente/recomendar', {
      method: 'POST',
      body: JSON.stringify({
        fechaEntrada,
        fechaSalida,
        numeroPersonas: Number(numeroPersonas),
        presupuestoPorNoche: presupuestoPorNoche ? Number(presupuestoPorNoche) : null,
        preferencias: preferencias || null
      }),
    });
  },

  async resumenDiario() {
    return await request('/asistente/resumen-diario');
  },

  async limpiezaPriorizada() {
    return await request('/asistente/limpieza-priorizada');
  }
};

// ==================== BASE DE CONOCIMIENTO DE LA IA (admin) ====================
export const ConfiguracionAPI = {
  async obtener() {
    return await request('/configuracion');
  },
  async actualizar(datos) {
    return await request('/configuracion', { method: 'PUT', body: JSON.stringify(datos) });
  }
};

// ==================== WEB PÚBLICA: datos del hotel y chatbot 24/7 ====================
export const PublicoAPI = {
  async hotel() {
    return await request('/publico/hotel');
  },
  // mensajes: [{ rol: 'usuario' | 'asistente', contenido }]
  async chat(mensajes) {
    return await request('/publico/chat', { method: 'POST', body: JSON.stringify({ mensajes }) });
  }
};

// ==================== TRADUCCIÓN AUTOMÁTICA (recepción) ====================
export const TraduccionAPI = {
  async traducir(texto, idiomaDestino) {
    return await request('/traduccion', { method: 'POST', body: JSON.stringify({ texto, idiomaDestino }) });
  }
};

// ==================== TARIFAS DINÁMICAS (admin y gerencia) ====================
export const TarifasAPI = {
  async pendientes() {
    return await request('/tarifas/recomendaciones');
  },
  async historial() {
    return await request('/tarifas/historial');
  },
  async analizar(desde, hasta) {
    const q = new URLSearchParams();
    if (desde) q.set('desde', desde);
    if (hasta) q.set('hasta', hasta);
    const qs = q.toString();
    return await request(`/tarifas/analizar${qs ? '?' + qs : ''}`, { method: 'POST' });
  },
  async decidir(id, aprobar, porcentaje, comentario) {
    return await request(`/tarifas/recomendaciones/${id}/decidir`, {
      method: 'PATCH',
      body: JSON.stringify({ aprobar, porcentaje: porcentaje === '' || porcentaje == null ? null : Number(porcentaje), comentario: comentario || null })
    });
  },
  async temporadas() {
    return await request('/tarifas/temporadas');
  },
  async crearTemporada(datos) {
    return await request('/tarifas/temporadas', { method: 'POST', body: JSON.stringify(datos) });
  },
  async desactivarTemporada(id) {
    return await request(`/tarifas/temporadas/${id}/desactivar`, { method: 'PATCH' });
  }
};

export const EventosAPI = {
  async listar() {
    return await request('/eventos');
  },
  async crear(datos) {
    return await request('/eventos', { method: 'POST', body: JSON.stringify(datos) });
  },
  async actualizar(id, datos) {
    return await request(`/eventos/${id}`, { method: 'PUT', body: JSON.stringify(datos) });
  },
  async eliminar(id) {
    return await request(`/eventos/${id}`, { method: 'DELETE' });
  }
};

// Precio de una estancia con las tarifas de temporada vigentes (público)
export async function cotizarEstancia(habitacionId, entrada, salida) {
  const q = new URLSearchParams({ habitacionId, entrada, salida }).toString();
  return await request(`/publico/cotizacion?${q}`);
}

// ==================== AVISOS INSTANTÁNEOS E INCIDENCIAS ====================
export const AvisosAPI = {
  async recientes() {
    return await request('/avisos');
  },
  async enviar(datos) {
    return await request('/avisos', { method: 'POST', body: JSON.stringify(datos) });
  },
  // URL del canal en tiempo real (EventSource no admite encabezados: el token va en la URL)
  urlStream() {
    let token = '';
    try {
      token = localStorage.getItem('hotel_session_token') || '';
    } catch (e) {
      token = '';
    }
    return `${BASE_URL}/avisos/stream?token=${encodeURIComponent(token)}`;
  }
};

export const IncidenciasAPI = {
  async listar(habitacionId) {
    return await request(`/incidencias${habitacionId ? `?habitacionId=${habitacionId}` : ''}`);
  },
  async reportar(datos) {
    return await request('/incidencias', { method: 'POST', body: JSON.stringify(datos) });
  },
  async atender(id) {
    return await request(`/incidencias/${id}/atender`, { method: 'PATCH' });
  },
  async resolver(id, solucion) {
    return await request(`/incidencias/${id}/resolver`, { method: 'PATCH', body: JSON.stringify({ solucion }) });
  }
};

// ==================== MERCADO PAGO (pasarela de pago) ====================
export const MercadoPagoAPI = {
  async estado() {
    return await request('/pagos/mercadopago/estado');
  },
  // Link de pago del saldo de una estadía (recepción)
  async linkEstadia(estadiaId, monto) {
    return await request(`/pagos/mercadopago/estadias/${estadiaId}`, {
      method: 'POST',
      body: JSON.stringify(monto ? { monto: Number(monto) } : {})
    });
  },
  // Prepago de una reserva (los clientes usan ClienteAPI.pagar en lib/cliente.js)
  async pagarReserva(codigoReserva) {
    return await request(`/publico/reservas/${encodeURIComponent(codigoReserva)}/pagar`, { method: 'POST' });
  },
  // Al volver de Mercado Pago se verifica el pago contra su API
  async verificar(paymentId) {
    return await request(`/publico/mercadopago/verificar?payment_id=${encodeURIComponent(paymentId)}`, { method: 'POST' });
  }
};

// ==================== MONITOREO (administrador y gerencia) ====================
export const MonitoreoAPI = {
  async resumen() {
    return await request('/monitoreo');
  }
};
