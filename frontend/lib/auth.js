// Módulo de Autenticación y Control de Acceso por Roles
// Hotel Princes Ica

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
const AUTH_STORAGE_KEY = 'hotel_session_user';
export const TOKEN_STORAGE_KEY = 'hotel_session_token';

export const AuthAPI = {
  // Obtener usuario actualmente autenticado
  getUsuarioActual() {
    if (typeof window === 'undefined') return null;
    try {
      const data = localStorage.getItem(AUTH_STORAGE_KEY);
      if (!data || data === 'undefined' || data === 'null') return null;
      return JSON.parse(data);
    } catch (e) {
      return null;
    }
  },

  // Verificar si hay sesión activa
  isAuthenticated() {
    return this.getUsuarioActual() !== null;
  },

  // Iniciar sesión contra el backend. No existe ingreso local: el backend valida todo.
  async login(username, password) {
    let res;
    try {
      res = await fetch(`${BASE_URL}/usuarios/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
    } catch (err) {
      throw new Error('No se pudo conectar con el servidor. Verifique que el backend esté en ejecución.');
    }

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.message || 'Usuario o contraseña incorrectos');
    }

    const data = await res.json();
    const payload = data.data || data;
    const user = payload.usuario || payload;
    this.setSession(user, payload.token);
    return user;
  },

  // No hay registro público del personal: las cuentas las crea el administrador en el panel (Usuarios).

  // Token JWT emitido por el backend
  getToken() {
    if (typeof window === 'undefined') return null;
    try {
      return localStorage.getItem(TOKEN_STORAGE_KEY);
    } catch (e) {
      return null;
    }
  },

  setSession(user, token) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      if (token) localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } catch (e) {
      console.error('Error guardando sesión', e);
    }
  },

  // Cerrar sesión
  logout() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      // Solo se borran los datos de sesión; el resto del navegador queda intacto
      localStorage.removeItem('userRole');
      localStorage.removeItem('userName');
    } catch (e) {
      console.error('Error cerrando sesión', e);
    }
  }
};
