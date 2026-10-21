// Portal del cliente (huéspedes que reservan desde la web).
// Su sesión se guarda aparte de la del personal: un cliente nunca entra al panel
// y el personal no necesita cerrar su sesión para probar la web pública.

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
const CLIENTE_KEY = 'hotel_cliente_user';
const TOKEN_KEY = 'hotel_cliente_token';
// Evento para que el encabezado se actualice al ingresar o salir sin recargar la página
export const EVENTO_SESION_CLIENTE = 'hotel-cliente-sesion';

function avisarCambio() {
  try {
    window.dispatchEvent(new Event(EVENTO_SESION_CLIENTE));
  } catch (e) {
    // navegador sin soporte de eventos: el encabezado se actualiza al recargar
  }
}

function leer(clave) {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(clave);
  } catch (e) {
    return null;
  }
}

function guardarSesion(cliente, token) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CLIENTE_KEY, JSON.stringify(cliente));
    if (token) localStorage.setItem(TOKEN_KEY, token);
  } catch (e) {
    console.error('No se pudo guardar la sesión del cliente', e);
  }
  avisarCambio();
}

function borrarSesion() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(CLIENTE_KEY);
    localStorage.removeItem(TOKEN_KEY);
  } catch (e) {
    // sin almacenamiento disponible: nada que borrar
  }
  avisarCambio();
}

async function solicitud(endpoint, { method = 'GET', body, conToken = true } = {}) {
  const headers = { 'Content-Type': 'application/json', Accept: 'application/json' };
  const token = leer(TOKEN_KEY);
  if (conToken && token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${BASE_URL}${endpoint}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined
    });
  } catch (err) {
    throw new Error('No se pudo conectar con el servidor. Intente de nuevo en unos minutos.');
  }

  const data = await res.json().catch(() => ({}));
  if (res.status === 401 && conToken) {
    borrarSesion();
    const e = new Error('Su sesión venció. Inicie sesión de nuevo.');
    e.status = 401;
    throw e;
  }
  if (!res.ok) {
    const e = new Error(data.message || `Error ${res.status}`);
    e.status = res.status;
    // Errores por campo que envía el servidor ({ campo: mensaje })
    e.campos = data.errors || null;
    if (e.campos && !data.message) e.message = Object.values(e.campos).join('. ');
    throw e;
  }
  return data.data !== undefined ? data.data : data;
}

export const ClienteAPI = {
  getCliente() {
    const raw = leer(CLIENTE_KEY);
    if (!raw || raw === 'undefined' || raw === 'null') return null;
    try {
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  },

  isAuthenticated() {
    return Boolean(this.getCliente() && leer(TOKEN_KEY));
  },

  async registrar(datos) {
    const sesion = await solicitud('/cliente/registro', { method: 'POST', body: datos, conToken: false });
    guardarSesion(sesion.cliente, sesion.token);
    return sesion.cliente;
  },

  async login(email, password) {
    const sesion = await solicitud('/cliente/login', { method: 'POST', body: { email, password }, conToken: false });
    guardarSesion(sesion.cliente, sesion.token);
    return sesion.cliente;
  },

  logout() {
    borrarSesion();
  },

  async perfil() {
    const p = await solicitud('/cliente/perfil');
    guardarSesion(p, null);
    return p;
  },

  async actualizarPerfil(datos) {
    const p = await solicitud('/cliente/perfil', { method: 'PUT', body: datos });
    guardarSesion(p, null);
    return p;
  },

  async misReservas() {
    return await solicitud('/cliente/reservas');
  },

  async reservar(datos) {
    return await solicitud('/cliente/reservas', { method: 'POST', body: datos });
  },

  async cancelar(id) {
    return await solicitud(`/cliente/reservas/${id}/cancelar`, { method: 'PATCH' });
  },

  // Pago en línea de una reserva con Mercado Pago (devuelve la URL de pago)
  async pagar(codigoReserva) {
    return await solicitud(`/publico/reservas/${encodeURIComponent(codigoReserva)}/pagar`, { method: 'POST', conToken: false });
  }
};
