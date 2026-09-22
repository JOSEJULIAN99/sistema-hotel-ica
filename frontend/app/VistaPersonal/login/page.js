'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthAPI } from '../../../lib/auth';
import { useToast } from '../../components/Toast';

export default function LoginPage() {
  const router = useRouter();
  const { addToast } = useToast();

  // Modo: 'LOGIN' o 'REGISTER'
  const [isRegister, setIsRegister] = useState(false);

  // Campos de Login
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Campos de Registro
  const [regNombre, setRegNombre] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regTelefono, setRegTelefono] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPasswordConfirm, setRegPasswordConfirm] = useState('');

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (AuthAPI.isAuthenticated()) {
      router.push('/VistaPersonal');
    }
  }, [router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      addToast('Ingresa usuario y contraseña', 'error');
      return;
    }

    setLoading(true);
    try {
      const user = await AuthAPI.login(username.trim(), password.trim());
      addToast(`Bienvenido/a ${user.nombreCompleto || user.username}`, 'success');
      router.push('/VistaPersonal');
    } catch (err) {
      addToast(err.message || 'Credenciales incorrectas', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!regNombre.trim() || !regUsername.trim() || !regPassword.trim()) {
      addToast('Por favor completa los campos obligatorios', 'error');
      return;
    }

    if (regPassword !== regPasswordConfirm) {
      addToast('Las contraseñas no coinciden', 'error');
      return;
    }

    if (regPassword.length < 4) {
      addToast('La contraseña debe tener al menos 4 caracteres', 'warning');
      return;
    }

    setLoading(true);
    try {
      await AuthAPI.register({
        nombreCompleto: regNombre.trim(),
        username: regUsername.trim().toLowerCase(),
        email: regEmail.trim() || null,
        telefono: regTelefono.trim() || null,
        password: regPassword,
        rol: 'RECEPCIONISTA',
        turno: 'General'
      });

      addToast('¡Cuenta creada con éxito! Iniciando sesión...', 'success');

      // Iniciar sesión con la nueva cuenta
      const user = await AuthAPI.login(regUsername.trim().toLowerCase(), regPassword);
      router.push('/VistaPersonal');
    } catch (err) {
      addToast(err.message || 'Error al registrar la cuenta', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4 font-sans text-slate-800">
      
      {/* Tarjeta Básica de Autenticación */}
      <div className="w-full max-w-sm bg-white p-6 sm:p-8 rounded-xl border border-slate-300 shadow-sm space-y-5">
        
        <div className="text-center space-y-1">
          <h1 className="text-xl font-bold text-slate-900">Hotel Princes Ica</h1>
          <p className="text-xs text-slate-500">
            {isRegister ? 'Registro de Nueva Cuenta' : 'Acceso al Sistema'}
          </p>
        </div>

        {/* Selector Login / Registro */}
        <div className="flex border border-slate-200 rounded-lg p-1 bg-slate-50 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setIsRegister(false)}
            className={`flex-1 py-1.5 rounded-md transition ${
              !isRegister ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            onClick={() => setIsRegister(true)}
            className={`flex-1 py-1.5 rounded-md transition ${
              isRegister ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Registrarse
          </button>
        </div>

        {!isRegister ? (
          /* FORMULARIO DE LOGIN */
          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Usuario</label>
              <input
                type="text"
                required
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ingresa tu usuario"
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Contraseña</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa tu contraseña"
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg transition disabled:opacity-50"
            >
              {loading ? 'Ingresando...' : 'Iniciar Sesión'}
            </button>
          </form>
        ) : (
          /* FORMULARIO DE REGISTRO */
          <form onSubmit={handleRegister} className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nombre Completo *</label>
              <input
                type="text"
                required
                value={regNombre}
                onChange={(e) => setRegNombre(e.target.value)}
                placeholder="Ej: Juan Pérez"
                className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nombre de Usuario *</label>
              <input
                type="text"
                required
                value={regUsername}
                onChange={(e) => setRegUsername(e.target.value)}
                placeholder="Ej: jperez"
                className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Correo</label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="correo@ejemplo.com"
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Teléfono</label>
                <input
                  type="tel"
                  value={regTelefono}
                  onChange={(e) => setRegTelefono(e.target.value)}
                  placeholder="987654321"
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Contraseña *</label>
              <input
                type="password"
                required
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                placeholder="Mínimo 4 caracteres"
                className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Confirmar Contraseña *</label>
              <input
                type="password"
                required
                value={regPasswordConfirm}
                onChange={(e) => setRegPasswordConfirm(e.target.value)}
                placeholder="Repite la contraseña"
                className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg transition disabled:opacity-50 mt-1"
            >
              {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
            </button>
          </form>
        )}

        {/* Enlace para volver a la página principal */}
        <div className="text-center pt-3 border-t border-slate-200">
          <Link href="/" className="text-xs text-amber-600 hover:underline">
            ← Volver a la página principal
          </Link>
        </div>
      </div>
    </div>
  );
}
