'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { UserPlus, Search, Edit2, KeyRound, ShieldCheck, X, RefreshCw, Phone, Mail, Clock } from 'lucide-react';
import { UsuarioAPI } from '../../../lib/api';
import { AuthAPI } from '../../../lib/auth';
import { useToast } from '../../components/Toast';

// Gestión del personal: el administrador crea las cuentas, asigna el rol y el turno,
// activa o desactiva el acceso y restablece contraseñas. Los trabajadores no se registran solos.

const ROLES = [
  { valor: 'ADMINISTRADOR', texto: 'Administrador', clase: 'bg-slate-900 text-white' },
  { valor: 'GERENTE', texto: 'Gerente', clase: 'bg-violet-100 text-violet-800' },
  { valor: 'RECEPCIONISTA', texto: 'Recepcionista', clase: 'bg-sky-100 text-sky-800' },
  { valor: 'LIMPIEZA', texto: 'Limpieza', clase: 'bg-emerald-100 text-emerald-800' }
];
const TURNOS = ['Mañana', 'Tarde', 'Noche', 'General'];
const VACIO = { nombreCompleto: '', username: '', email: '', telefono: '', rol: 'RECEPCIONISTA', turno: 'Mañana', password: '' };

const rolInfo = (rol) => ROLES.find((r) => r.valor === rol) || { texto: rol, clase: 'bg-slate-100 text-slate-700' };

// Contraseña temporal legible (sin caracteres que se confunden: 0/O, 1/l)
function generarClave() {
  const letras = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let clave = '';
  const valores = new Uint32Array(10);
  window.crypto.getRandomValues(valores);
  valores.forEach((v) => { clave += letras[v % letras.length]; });
  return clave;
}

function validar(f, esNuevo) {
  const e = {};
  if (!f.nombreCompleto.trim()) e.nombreCompleto = 'Ingrese el nombre completo';
  if (esNuevo) {
    if (!/^[A-Za-z0-9._-]{3,50}$/.test(f.username.trim())) e.username = 'De 3 a 50 caracteres: letras, números, punto o guion';
    if (f.password.length < 8) e.password = 'Mínimo 8 caracteres';
  }
  if (f.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim())) e.email = 'Correo no válido';
  if (f.telefono && !/^\+?[0-9 ]{7,15}$/.test(f.telefono.trim())) e.telefono = 'Solo números (7 a 15)';
  return e;
}

export default function UsuariosPage() {
  const { addToast } = useToast();
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtroRol, setFiltroRol] = useState('TODOS');
  const [verInactivos, setVerInactivos] = useState(true);
  const [editando, setEditando] = useState(null); // null = cerrado, {} = nuevo, usuario = edición
  const [form, setForm] = useState(VACIO);
  const [errores, setErrores] = useState({});
  const [guardando, setGuardando] = useState(false);
  const [claveDe, setClaveDe] = useState(null);
  const [nuevaClave, setNuevaClave] = useState('');
  const [yo, setYo] = useState(null);

  const cargar = async () => {
    setCargando(true);
    try {
      setUsuarios((await UsuarioAPI.getAll()) || []);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    setYo(AuthAPI.getUsuarioActual());
    cargar();
  }, []);

  const lista = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return usuarios
      .filter((u) => filtroRol === 'TODOS' || u.rol === filtroRol)
      .filter((u) => verInactivos || u.activo)
      .filter((u) => !q || [u.nombreCompleto, u.username, u.email].some((x) => (x || '').toLowerCase().includes(q)))
      .sort((a, b) => Number(b.activo) - Number(a.activo) || (a.nombreCompleto || '').localeCompare(b.nombreCompleto || ''));
  }, [usuarios, busqueda, filtroRol, verInactivos]);

  const resumen = ROLES.map((r) => ({ ...r, total: usuarios.filter((u) => u.rol === r.valor && u.activo).length }));

  const abrirNuevo = () => {
    setForm({ ...VACIO, password: generarClave() });
    setErrores({});
    setEditando({});
  };

  const abrirEdicion = (u) => {
    setForm({ ...VACIO, ...u, email: u.email || '', telefono: u.telefono || '', turno: u.turno || 'Mañana', password: '' });
    setErrores({});
    setEditando(u);
  };

  const guardar = async (e) => {
    e.preventDefault();
    const esNuevo = !editando?.id;
    const encontrados = validar(form, esNuevo);
    setErrores(encontrados);
    if (Object.keys(encontrados).length) return;
    setGuardando(true);
    try {
      const datos = {
        nombreCompleto: form.nombreCompleto.trim(),
        email: form.email.trim() || null,
        telefono: form.telefono.trim() || null,
        rol: form.rol,
        turno: form.turno
      };
      if (esNuevo) {
        await UsuarioAPI.create({ ...datos, username: form.username.trim().toLowerCase(), password: form.password });
        addToast(`Usuario ${form.username.trim().toLowerCase()} creado. Entrégale su contraseña temporal.`, 'success');
      } else {
        await UsuarioAPI.update(editando.id, { ...datos, activo: editando.activo });
        addToast('Datos actualizados', 'success');
      }
      setEditando(null);
      cargar();
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setGuardando(false);
    }
  };

  const alternarActivo = async (u) => {
    try {
      await UsuarioAPI.cambiarActivo(u.id, !u.activo);
      addToast(u.activo ? `${u.nombreCompleto} ya no puede ingresar` : `${u.nombreCompleto} puede ingresar de nuevo`, 'success');
      cargar();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const restablecer = async () => {
    if (nuevaClave.length < 8) {
      addToast('La contraseña debe tener al menos 8 caracteres', 'error');
      return;
    }
    try {
      await UsuarioAPI.restablecerPassword(claveDe.id, nuevaClave);
      addToast(`Contraseña de ${claveDe.username} restablecida`, 'success');
      setClaveDe(null);
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const campo = (nombre) =>
    `mt-1 w-full px-3 py-2.5 rounded-xl border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 ${errores[nombre] ? 'border-rose-400' : 'border-slate-300'}`;
  const ErrorCampo = ({ nombre }) => (errores[nombre] ? <p className="mt-1 text-xs text-rose-600">{errores[nombre]}</p> : null);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-black text-slate-900 flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-amber-500" /> Usuarios del personal</h1>
          <p className="text-sm text-slate-500 mt-1">Crea las cuentas de los trabajadores, asigna su rol y controla quién puede ingresar al panel.</p>
        </div>
        <button onClick={abrirNuevo} className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm flex items-center gap-2">
          <UserPlus className="w-4 h-4" /> Nuevo usuario
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {resumen.map((r) => (
          <button key={r.valor} onClick={() => setFiltroRol(filtroRol === r.valor ? 'TODOS' : r.valor)}
            className={`text-left p-4 rounded-2xl border bg-white transition ${filtroRol === r.valor ? 'border-amber-400 ring-2 ring-amber-200' : 'border-slate-200 hover:border-slate-300'}`}>
            <p className="text-2xl font-black text-slate-900">{r.total}</p>
            <p className="text-xs font-semibold text-slate-500">{r.texto}{r.total === 1 ? '' : 's'} activos</p>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs">
        <div className="p-4 flex flex-col sm:flex-row gap-3 sm:items-center justify-between border-b border-slate-100">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar por nombre, usuario o correo"
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
          </div>
          <div className="flex items-center gap-3 text-sm">
            <label className="flex items-center gap-2 text-slate-600">
              <input type="checkbox" checked={verInactivos} onChange={(e) => setVerInactivos(e.target.checked)} /> Mostrar desactivados
            </label>
            <button onClick={cargar} className="p-2.5 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-50" title="Actualizar"><RefreshCw className="w-4 h-4" /></button>
          </div>
        </div>

        {cargando ? (
          <p className="p-8 text-center text-sm text-slate-500">Cargando usuarios…</p>
        ) : lista.length === 0 ? (
          <p className="p-8 text-center text-sm text-slate-500">No hay usuarios con esos filtros.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="text-left px-4 py-3">Trabajador</th>
                  <th className="text-left px-4 py-3">Rol</th>
                  <th className="text-left px-4 py-3 hidden md:table-cell">Contacto</th>
                  <th className="text-left px-4 py-3">Acceso</th>
                  <th className="text-right px-4 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {lista.map((u) => {
                  const info = rolInfo(u.rol);
                  const soyYo = yo && yo.username === u.username;
                  return (
                    <tr key={u.id} className={u.activo ? '' : 'bg-slate-50 text-slate-400'}>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-slate-900">{u.nombreCompleto} {soyYo && <span className="text-xs text-amber-600">(tú)</span>}</p>
                        <p className="text-xs text-slate-500 font-mono">{u.username}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${info.clase}`}>{info.texto}</span>
                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1"><Clock className="w-3 h-3" /> {u.turno || '—'}</p>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-xs text-slate-600 space-y-1">
                        <p className="flex items-center gap-1"><Mail className="w-3 h-3" /> {u.email || '—'}</p>
                        <p className="flex items-center gap-1"><Phone className="w-3 h-3" /> {u.telefono || '—'}</p>
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => alternarActivo(u)} disabled={soyYo}
                          title={soyYo ? 'No puedes desactivar tu propia cuenta' : u.activo ? 'Desactivar acceso' : 'Activar acceso'}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition disabled:opacity-40 ${u.activo ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                          <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${u.activo ? 'translate-x-5' : 'translate-x-0.5'}`} />
                        </button>
                        <p className="text-xs mt-1">{u.activo ? 'Activo' : 'Desactivado'}</p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => abrirEdicion(u)} className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50" title="Editar"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => { setClaveDe(u); setNuevaClave(generarClave()); }} className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50" title="Restablecer contraseña"><KeyRound className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editando && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4 overflow-y-auto">
          <form onSubmit={guardar} noValidate className="bg-white rounded-2xl w-full max-w-lg shadow-xl my-6">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="font-bold text-slate-900">{editando.id ? `Editar a ${editando.nombreCompleto}` : 'Nuevo usuario del personal'}</h2>
              <button type="button" onClick={() => setEditando(null)} className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 grid sm:grid-cols-2 gap-4">
              <label className="block sm:col-span-2 text-sm">
                <span className="font-semibold text-slate-700">Nombre completo *</span>
                <input value={form.nombreCompleto} onChange={(e) => setForm({ ...form, nombreCompleto: e.target.value })} className={campo('nombreCompleto')} />
                <ErrorCampo nombre="nombreCompleto" />
              </label>
              <label className="block text-sm">
                <span className="font-semibold text-slate-700">Usuario *</span>
                <input value={form.username} disabled={Boolean(editando.id)} onChange={(e) => setForm({ ...form, username: e.target.value })}
                  className={`${campo('username')} disabled:bg-slate-100`} placeholder="Ej: jperez" />
                <ErrorCampo nombre="username" />
              </label>
              <label className="block text-sm">
                <span className="font-semibold text-slate-700">Rol *</span>
                <select value={form.rol} onChange={(e) => setForm({ ...form, rol: e.target.value })} className={campo('rol')}
                  disabled={Boolean(editando.id) && yo?.username === editando.username}>
                  {ROLES.map((r) => <option key={r.valor} value={r.valor}>{r.texto}</option>)}
                </select>
              </label>
              <label className="block text-sm">
                <span className="font-semibold text-slate-700">Correo</span>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={campo('email')} />
                <ErrorCampo nombre="email" />
              </label>
              <label className="block text-sm">
                <span className="font-semibold text-slate-700">Celular</span>
                <input value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} className={campo('telefono')} />
                <ErrorCampo nombre="telefono" />
              </label>
              <label className="block text-sm">
                <span className="font-semibold text-slate-700">Turno</span>
                <select value={form.turno} onChange={(e) => setForm({ ...form, turno: e.target.value })} className={campo('turno')}>
                  {TURNOS.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </label>
              {!editando.id && (
                <label className="block text-sm">
                  <span className="font-semibold text-slate-700">Contraseña temporal *</span>
                  <div className="flex gap-2">
                    <input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className={`${campo('password')} font-mono`} />
                    <button type="button" onClick={() => setForm({ ...form, password: generarClave() })} className="mt-1 px-3 rounded-xl border border-slate-300 text-slate-600" title="Generar otra"><RefreshCw className="w-4 h-4" /></button>
                  </div>
                  <ErrorCampo nombre="password" />
                </label>
              )}
            </div>
            <div className="px-6 py-4 bg-slate-50 rounded-b-2xl flex justify-end gap-2">
              <button type="button" onClick={() => setEditando(null)} className="px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold">Cancelar</button>
              <button type="submit" disabled={guardando} className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold disabled:opacity-50">
                {guardando ? 'Guardando…' : editando.id ? 'Guardar cambios' : 'Crear usuario'}
              </button>
            </div>
          </form>
        </div>
      )}

      {claveDe && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl p-6 space-y-4">
            <KeyRound className="w-8 h-8 text-amber-500" />
            <div>
              <h2 className="font-bold text-slate-900">Restablecer contraseña</h2>
              <p className="text-sm text-slate-500">Nueva contraseña temporal para <span className="font-semibold">{claveDe.username}</span>. Entrégasela en persona.</p>
            </div>
            <div className="flex gap-2">
              <input value={nuevaClave} onChange={(e) => setNuevaClave(e.target.value)} className="flex-1 px-3 py-2.5 rounded-xl border border-slate-300 font-mono text-sm" />
              <button onClick={() => setNuevaClave(generarClave())} className="px-3 rounded-xl border border-slate-300 text-slate-600" title="Generar otra"><RefreshCw className="w-4 h-4" /></button>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setClaveDe(null)} className="flex-1 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold">Cancelar</button>
              <button onClick={restablecer} className="flex-1 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold">Restablecer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
