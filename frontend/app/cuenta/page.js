'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, Mail, User, ShieldCheck, CalendarCheck2, CreditCard, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { ClienteAPI } from '../../lib/cliente';
import * as V from '../../lib/validaciones';
import { useToast } from '../components/Toast';

// Solo se permite volver a una ruta interna (evita redirecciones a otros sitios)
function destinoSeguro(valor) {
  if (!valor || !valor.startsWith('/') || valor.startsWith('//')) return '/cuenta/reservas';
  return valor;
}

const REGISTRO_VACIO = {
  nombres: '',
  apellidos: '',
  tipoDocumento: 'DNI',
  numeroDocumento: '',
  email: '',
  telefono: '',
  nacionalidad: 'Peruana',
  ciudadProcedencia: '',
  password: '',
  confirmar: ''
};

export default function CuentaPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [modo, setModo] = useState('ingreso');
  const [destino, setDestino] = useState('/cuenta/reservas');
  const [cargando, setCargando] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verPassword, setVerPassword] = useState(false);
  const [verConfirmarPassword, setVerConfirmarPassword] = useState(false);
  const [registro, setRegistro] = useState(REGISTRO_VACIO);
  const [errores, setErrores] = useState({});

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('modo') === 'registro') setModo('registro');
    const volver = destinoSeguro(params.get('volver'));
    setDestino(volver);
    if (ClienteAPI.isAuthenticated()) router.replace(volver);
  }, [router]);

  const cambiar = (campo) => (e) => {
    let valor = e.target.value;
    if (campo === 'numeroDocumento') valor = valor.toUpperCase().replace(/\s/g, '');
    if (campo === 'numeroDocumento' && registro.tipoDocumento === 'DNI') valor = valor.replace(/\D/g, '').slice(0, 8);
    setRegistro((r) => ({ ...r, [campo]: valor }));
    if (errores[campo]) setErrores((x) => ({ ...x, [campo]: undefined }));
  };

  // Al salir de un campo se revisa solo ese campo, para avisar sin esperar al botón
  const revisar = (campo) => () => {
    const msg = V.registroCliente(registro)[campo];
    setErrores((x) => ({ ...x, [campo]: msg }));
  };

  const ingresar = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      addToast('Ingrese su correo y contraseña', 'error');
      return;
    }
    setCargando(true);
    try {
      const cliente = await ClienteAPI.login(email.trim(), password);
      addToast(`Hola, ${cliente.nombres || 'bienvenido/a'}`, 'success');
      router.push(destino);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setCargando(false);
    }
  };

  const registrarse = async (e) => {
    e.preventDefault();
    const encontrados = V.registroCliente(registro);
    setErrores(encontrados);
    if (Object.keys(encontrados).length > 0) {
      addToast('Revise los campos marcados', 'error');
      return;
    }
    setCargando(true);
    try {
      const { confirmar, ...datos } = registro;
      const cliente = await ClienteAPI.registrar({
        ...datos,
        nombres: datos.nombres.trim(),
        apellidos: datos.apellidos.trim(),
        numeroDocumento: datos.numeroDocumento.trim(),
        email: datos.email.trim()
      });
      addToast(`Cuenta creada. ¡Bienvenido/a, ${cliente.nombres}!`, 'success');
      router.push(destino);
    } catch (err) {
      if (err.campos) setErrores(err.campos);
      addToast(err.message, 'error');
    } finally {
      setCargando(false);
    }
  };

  const campo = 'w-full px-3 py-2.5 rounded-xl border bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400';
  const borde = (nombre) => (errores[nombre] ? 'border-rose-400' : 'border-slate-300');
  const ErrorCampo = ({ nombre }) => (errores[nombre] ? <p className="mt-1 text-xs text-rose-600">{errores[nombre]}</p> : null);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 grid lg:grid-cols-[0.9fr_1.1fr] gap-8 items-start">
      <section className="hidden lg:block rounded-3xl overflow-hidden bg-slate-900 text-white p-8 relative min-h-[520px]">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40"
          style={{ backgroundImage: "url('/portada.jpg'), url('/portada-huacachina.svg')" }}
        />
        <div className="relative space-y-6">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-amber-300">Tu cuenta en Hotel Princes</span>
          <h1 className="text-3xl font-black leading-tight">Reserva en minutos y lleva el control de tu estadía</h1>
          <ul className="space-y-4 text-sm text-slate-100">
            <li className="flex gap-3"><CalendarCheck2 className="w-5 h-5 text-amber-300 shrink-0" /> Consulta tus reservas y su estado en todo momento.</li>
            <li className="flex gap-3"><CreditCard className="w-5 h-5 text-amber-300 shrink-0" /> Paga en línea con Mercado Pago y recibe la confirmación al instante.</li>
            <li className="flex gap-3"><ShieldCheck className="w-5 h-5 text-amber-300 shrink-0" /> Tus datos se guardan una sola vez y solo tú los ves.</li>
          </ul>
        </div>
      </section>

      <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <div className="inline-flex p-1 bg-slate-100 rounded-xl mb-6 text-sm font-bold">
          <button
            type="button"
            onClick={() => setModo('ingreso')}
            className={`px-4 py-2 rounded-lg transition ${modo === 'ingreso' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}
          >
            Ingresar
          </button>
          <button
            type="button"
            onClick={() => setModo('registro')}
            className={`px-4 py-2 rounded-lg transition ${modo === 'registro' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}
          >
            Crear cuenta
          </button>
        </div>

        {modo === 'ingreso' ? (
          <form onSubmit={ingresar} className="space-y-4">
            <div>
              <h2 className="text-2xl font-black text-slate-900">Bienvenido/a de nuevo</h2>
              <p className="text-sm text-slate-500 mt-1">Ingresa con el correo con el que te registraste.</p>
            </div>
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Correo</span>
              <div className="mt-1 relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className={`${campo} border-slate-300 pl-9`} placeholder="tu@correo.com" />
              </div>
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Contraseña</span>
              <div className="mt-1 relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type={verPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${campo} border-slate-300 pl-9 pr-10`}
                  placeholder="••••••••" />
                <button
                  type="button"
                  onClick={() => setVerPassword(!verPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  {verPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>
            </label>
            <button type="submit" disabled={cargando}
              className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition disabled:opacity-50 flex items-center justify-center gap-2">
              {cargando ? 'Ingresando…' : <>Ingresar <ArrowRight className="w-4 h-4" /></>}
            </button>
            <p className="text-sm text-slate-500 text-center">
              ¿Aún no tienes cuenta?{' '}
              <button type="button" onClick={() => setModo('registro')} className="font-bold text-amber-700 hover:underline">Crea una gratis</button>
            </p>
          </form>
        ) : (
          <form onSubmit={registrarse} noValidate className="space-y-4">
            <div>
              <h2 className="text-2xl font-black text-slate-900">Crea tu cuenta</h2>
              <p className="text-sm text-slate-500 mt-1">Usaremos estos datos para tus reservas y tu registro de ingreso al hotel.</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Nombres *</span>
                <input value={registro.nombres} onChange={cambiar('nombres')} onBlur={revisar('nombres')} autoComplete="given-name"
                  className={`mt-1 ${campo} ${borde('nombres')}`} placeholder="Ej: Ana María" />
                <ErrorCampo nombre="nombres" />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Apellidos *</span>
                <input value={registro.apellidos} onChange={cambiar('apellidos')} onBlur={revisar('apellidos')} autoComplete="family-name"
                  className={`mt-1 ${campo} ${borde('apellidos')}`} placeholder="Ej: Quispe Rojas" />
                <ErrorCampo nombre="apellidos" />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Tipo de documento *</span>
                <select value={registro.tipoDocumento} onChange={cambiar('tipoDocumento')} className={`mt-1 ${campo} border-slate-300`}>
                  <option value="DNI">DNI</option>
                  <option value="CARNET_EXTRANJERIA">Carné de extranjería</option>
                  <option value="PASAPORTE">Pasaporte</option>
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Número de documento *</span>
                <input value={registro.numeroDocumento} onChange={cambiar('numeroDocumento')} onBlur={revisar('numeroDocumento')}
                  inputMode={registro.tipoDocumento === 'DNI' ? 'numeric' : 'text'}
                  className={`mt-1 ${campo} ${borde('numeroDocumento')}`} placeholder={registro.tipoDocumento === 'DNI' ? '8 dígitos' : 'Como figura en el documento'} />
                <ErrorCampo nombre="numeroDocumento" />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Correo *</span>
                <input type="email" value={registro.email} onChange={cambiar('email')} onBlur={revisar('email')} autoComplete="email"
                  className={`mt-1 ${campo} ${borde('email')}`} placeholder="tu@correo.com" />
                <ErrorCampo nombre="email" />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Celular</span>
                <input type="tel" value={registro.telefono} onChange={cambiar('telefono')} onBlur={revisar('telefono')} autoComplete="tel"
                  className={`mt-1 ${campo} ${borde('telefono')}`} placeholder="999888777" />
                <ErrorCampo nombre="telefono" />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Nacionalidad</span>
                <input value={registro.nacionalidad} onChange={cambiar('nacionalidad')}
                  className={`mt-1 ${campo} border-slate-300`} />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Ciudad de procedencia</span>
                <input value={registro.ciudadProcedencia} onChange={cambiar('ciudadProcedencia')}
                  className={`mt-1 ${campo} border-slate-300`} placeholder="Ej: Lima" />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Contraseña *</span>
                <div className="mt-1 relative">
                  <input type={verPassword ? 'text' : 'password'} value={registro.password} onChange={cambiar('password')} onBlur={revisar('password')} autoComplete="new-password"
                    className={`${campo} ${borde('password')} pr-10`} placeholder="Letras y números, mínimo 8" />
                  <button
                    type="button"
                    onClick={() => setVerPassword(!verPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    aria-label={verPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {verPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <ErrorCampo nombre="password" />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Repetir contraseña *</span>
                <div className="mt-1 relative">
                  <input type={verConfirmarPassword ? 'text' : 'password'} value={registro.confirmar} onChange={cambiar('confirmar')} onBlur={revisar('confirmar')} autoComplete="new-password"
                    className={`${campo} ${borde('confirmar')} pr-10`} />
                  <button
                    type="button"
                    onClick={() => setVerConfirmarPassword(!verConfirmarPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    aria-label={verConfirmarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {verConfirmarPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <ErrorCampo nombre="confirmar" />
              </label>
            </div>

            <button type="submit" disabled={cargando}
              className="w-full py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm transition disabled:opacity-50 flex items-center justify-center gap-2">
              <User className="w-4 h-4" /> {cargando ? 'Creando cuenta…' : 'Crear mi cuenta'}
            </button>
            <p className="text-sm text-slate-500 text-center">
              ¿Ya tienes cuenta?{' '}
              <button type="button" onClick={() => setModo('ingreso')} className="font-bold text-amber-700 hover:underline">Ingresa aquí</button>
            </p>
          </form>
        )}

        <p className="mt-8 pt-4 border-t border-slate-100 text-xs text-slate-400 text-center">
          ¿Trabajas en el hotel? <Link href="/VistaPersonal/login" className="font-semibold text-slate-500 hover:underline">Acceso del personal</Link>
        </p>
      </section>
    </div>
  );
}
