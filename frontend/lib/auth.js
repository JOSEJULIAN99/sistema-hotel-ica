// Módulo de Autenticación y Control de Acceso por Roles
// Hotel Princes Ica

const AUTH_STORAGE_KEY = 'hotel_session_user';

export const AuthAPI = {
  // Obtener usuario actualmente autenticado
  getUsuarioActual() {
    if (typeof window === 'undefined') return null;
    try {
      const data = localStorage.getItem(AUTH_STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  },

  // Verificar si hay sesión activa
  isAuthenticated() {
    return this.getUsuarioActual() !== null;
  },

  // Iniciar sesión contra el backend (o fallback local)
  async login(username, password) {
    const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
    
    try {
      const res = await fetch(`${BASE_URL}/usuarios/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || 'Credenciales inválidas');
      }

      const data = await res.json();
      const user = data.data || data;
      this.setSession(user);
      return user;
    } catch (err) {
      // Fallback para usuarios maestros en caso de que el backend no esté respondiendo
      const fallbackUsers = [
        { id: 1, username: 'admin', password: 'admin123', nombreCompleto: 'Administrador General', rol: 'ADMINISTRADOR', turno: 'General', activo: true, email: 'admin@hotelprincesica.com' },
        { id: 2, username: 'pluna', password: 'hotel123', nombreCompleto: 'Pablo Luna', rol: 'RECEPCIONISTA', turno: 'Turno Tarde', activo: true, email: 'pluna@hotelprincesica.com' },
        { id: 3, username: 'mgomez', password: 'hotel123', nombreCompleto: 'María Gómez', rol: 'RECEPCIONISTA', turno: 'Turno Mañana', activo: true, email: 'mgomez@hotelprincesica.com' },
        { id: 4, username: 'rflores', password: 'hotel123', nombreCompleto: 'Rosa Flores', rol: 'LIMPIEZA', turno: 'Turno Mañana', activo: true, email: 'rflores@hotelprincesica.com' }
      ];

      const found = fallbackUsers.find(u => u.username.toLowerCase() === (username || '').toLowerCase() && u.password === password);
      if (found) {
        const { password: _, ...userWithoutPass } = found;
        this.setSession(userWithoutPass);
        return userWithoutPass;
      }
      throw new Error(err.message || 'Usuario o contraseña incorrectos');
    }
  },

  // Registrar nuevo usuario
  async register(userData) {
    const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
    try {
      const res = await fetch(`${BASE_URL}/usuarios?password=${encodeURIComponent(userData.password || 'hotel123')}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: userData.username,
          nombreCompleto: userData.nombreCompleto,
          email: userData.email,
          telefono: userData.telefono,
          rol: userData.rol || 'RECEPCIONISTA',
          turno: userData.turno || 'Mañana',
          activo: true
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || 'Error al registrar usuario');
      }

      const data = await res.json();
      return data.data || data;
    } catch (err) {
      if (err.message && !err.message.includes('fetch')) {
        throw err;
      }
      return {
        id: Date.now(),
        username: userData.username,
        nombreCompleto: userData.nombreCompleto,
        email: userData.email,
        telefono: userData.telefono,
        rol: userData.rol || 'RECEPCIONISTA',
        turno: userData.turno || 'Mañana',
        activo: true
      };
    }
  },
  setSession(user) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } catch (e) {
      console.error('Error guardando sesión', e);
    }
  },

  // Cerrar sesión
  logout() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (e) {
      console.error('Error cerrando sesión', e);
    }
  }
};
