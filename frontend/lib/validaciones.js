// Reglas de validación de huéspedes y reservas, iguales a las del servidor (util/ValidadorDatos.java).
// En el navegador sirven para avisar al instante, campo por campo; el servidor las vuelve a aplicar.

export const MAX_NOCHES_WEB = 30;
export const MAX_DIAS_ANTICIPACION = 365;
export const MAX_OBSERVACIONES = 300;

const NOMBRE = /^[\p{L}][\p{L} '´.-]{1,79}$/u;
const DOCUMENTOS = {
  DNI: { re: /^\d{8}$/, msg: 'El DNI debe tener 8 dígitos' },
  CARNET_EXTRANJERIA: { re: /^[A-Z0-9]{9,12}$/, msg: 'El carné de extranjería tiene de 9 a 12 letras o números' },
  PASAPORTE: { re: /^[A-Z0-9]{6,12}$/, msg: 'El pasaporte tiene de 6 a 12 letras o números, sin espacios' },
  RUC: { re: /^(10|15|17|20)\d{9}$/, msg: 'El RUC debe tener 11 dígitos y empezar con 10, 15, 17 o 20' }
};

export function nombre(valor, etiqueta = 'nombres') {
  if (!valor || !valor.trim()) return `Ingrese sus ${etiqueta}`;
  return NOMBRE.test(valor.trim()) ? null : `Los ${etiqueta} solo pueden tener letras y espacios`;
}

export function documento(tipo, numero) {
  if (!tipo) return 'Seleccione el tipo de documento';
  if (!numero || !numero.trim()) return 'Ingrese el número de documento';
  const regla = DOCUMENTOS[tipo];
  return !regla || regla.re.test(numero.trim().toUpperCase()) ? null : regla.msg;
}

export function telefono(valor) {
  if (!valor || !valor.trim()) return null;
  const t = valor.replace(/[\s-]/g, '');
  return /^9\d{8}$/.test(t) || /^\+\d{8,15}$/.test(t)
    ? null
    : 'Celular de 9 dígitos que empiece con 9, o número internacional con + y código de país';
}

export function email(valor, obligatorio = false) {
  if (!valor || !valor.trim()) return obligatorio ? 'Ingrese su correo' : null;
  if (valor.trim().length > 50) return 'El correo no puede superar 50 caracteres';
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(valor.trim()) ? null : 'El correo no es válido';
}

export function password(valor) {
  if (!valor || valor.length < 8) return 'Use al menos 8 caracteres';
  return /[A-Za-zÁÉÍÓÚáéíóúÑñ]/.test(valor) && /\d/.test(valor) ? null : 'Combine letras y números';
}

// Fecha local en formato AAAA-MM-DD
export function hoyISO() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

function sumarDiasISO(iso, dias) {
  const d = new Date(`${iso}T12:00:00`);
  d.setDate(d.getDate() + dias);
  return d.toISOString().slice(0, 10);
}

export function nochesEntre(entrada, salida) {
  if (!entrada || !salida) return 0;
  return Math.round((new Date(`${salida}T12:00:00`) - new Date(`${entrada}T12:00:00`)) / 86400000);
}

// Reserva web: devuelve { campo: mensaje } (vacío si todo está bien)
export function estancia({ fechaEntrada, fechaSalida, numeroPersonas, capacidad, observaciones }) {
  const e = {};
  const hoy = hoyISO();
  if (!fechaEntrada) e.fechaEntrada = 'Seleccione la fecha de llegada';
  else if (fechaEntrada < hoy) e.fechaEntrada = 'La llegada no puede ser anterior a hoy';
  else if (fechaEntrada > sumarDiasISO(hoy, MAX_DIAS_ANTICIPACION)) e.fechaEntrada = 'Se puede reservar con hasta un año de anticipación';

  const noches = nochesEntre(fechaEntrada, fechaSalida);
  if (!fechaSalida) e.fechaSalida = 'Seleccione la fecha de salida';
  else if (noches < 1) e.fechaSalida = 'La salida debe ser al menos un día después de la llegada';
  else if (noches > MAX_NOCHES_WEB) e.fechaSalida = `Máximo ${MAX_NOCHES_WEB} noches en línea; para más, contacte al hotel`;

  const p = Number(numeroPersonas);
  if (!p || p < 1) e.numeroPersonas = 'Indique cuántas personas se alojarán';
  else if (capacidad && p > capacidad) e.numeroPersonas = `Esta habitación admite hasta ${capacidad} personas`;

  if (observaciones && observaciones.length > MAX_OBSERVACIONES) {
    e.observaciones = `Máximo ${MAX_OBSERVACIONES} caracteres`;
  }
  return e;
}

// Registro de cliente: devuelve { campo: mensaje }
export function registroCliente(d) {
  const e = {};
  const agregar = (campo, msg) => { if (msg) e[campo] = msg; };
  agregar('nombres', nombre(d.nombres, 'nombres'));
  agregar('apellidos', nombre(d.apellidos, 'apellidos'));
  agregar('numeroDocumento', documento(d.tipoDocumento, d.numeroDocumento));
  agregar('email', email(d.email, true));
  agregar('telefono', telefono(d.telefono));
  agregar('password', password(d.password));
  if (d.confirmar !== undefined && d.confirmar !== d.password) e.confirmar = 'Las contraseñas no coinciden';
  return e;
}

// Huésped registrado por recepción (panel): devuelve { campo: mensaje }
export function huesped(d) {
  const e = {};
  const agregar = (campo, msg) => { if (msg) e[campo] = msg; };
  agregar('nombres', nombre(d.nombres, 'nombres'));
  agregar('apellidos', nombre(d.apellidos, 'apellidos'));
  agregar('numeroDocumento', documento(d.tipoDocumento, d.numeroDocumento));
  agregar('telefono', telefono(d.telefono));
  agregar('email', email(d.email));
  return e;
}
