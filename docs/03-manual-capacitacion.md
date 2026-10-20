# Manual de capacitación — Sistema Hotel Princes Ica

Issue: HPI-10 · Sprint S5 · Rama `chore/despliegue-ci`

## 1. Ingreso al sistema

1. Abrir `http://localhost:3000/VistaPersonal/login` (o la dirección publicada del hotel).
2. Ingresar usuario y contraseña. La sesión dura 8 horas; luego el sistema pide ingresar de nuevo.
3. Una cuenta creada desde "Registrarse" queda inactiva hasta que el administrador la active.

| Rol | Pantallas disponibles |
| --- | --- |
| Administrador | Todas, incluida la gestión de usuarios |
| Gerente | Dashboard, recepción, reservas, transacciones, reportes, limpieza, asistente IA |
| Recepcionista | Dashboard, recepción, reservas, huéspedes, transacciones, asistente IA |
| Limpieza | Rack de habitaciones, aseo y limpieza, asistente IA (orden de limpieza) |

## 2. Operación diaria de recepción

1. **Reservar:** Reservaciones → Nueva. El sistema calcula el precio (noches × tarifa) y rechaza fechas que se cruzan con otra reserva.
2. **Recomendar habitación:** Asistente IA → Recomendador. Indique fechas, personas y presupuesto; el asistente muestra hasta 3 habitaciones libres. La reserva la registra usted.
3. **Check-in:** Recepción → Check-in. Solo se permite si la habitación está libre y la reserva está confirmada para hoy.
4. **Consumos y pagos:** se registran durante la estadía. Una estadía cerrada ya no admite cambios.
5. **Check-out:** el saldo debe quedar en cero. Al cerrar, se crea la tarea de limpieza automáticamente.

## 3. Limpieza

1. Abrir Aseo y Limpieza o Asistente IA → Orden sugerido.
2. Empezar por las habitaciones que reciben huésped hoy, luego por prioridad (URGENTE, ALTA, MEDIA, BAJA).
3. Marcar "Iniciar" y luego "Completar". La habitación vuelve a DISPONIBLE cuando no le quedan tareas abiertas.

## 4. Gerencia

- Asistente IA → Resumen del día: ocupación, movimientos, ingresos y alertas.
- Reportes y Transacciones leen los pagos reales registrados en el sistema.

## 5. Mensajes frecuentes

| Mensaje | Qué significa | Qué hacer |
| --- | --- | --- |
| "Debe iniciar sesión para continuar" | La sesión venció | Ingresar de nuevo |
| "Su rol no tiene permiso para esta operación" | La acción corresponde a otro rol | Pedirla al administrador o gerente |
| "ya tiene una reserva que se cruza" | Habitación tomada en esas fechas | Usar el recomendador para ver alternativas |
| "saldo pendiente" | Falta cobrar antes del check-out | Registrar el pago y repetir |
| "No se pudo conectar con el servidor" | Backend apagado o sin red | Avisar a soporte |

## 6. Despliegue

```bash
cp .env.example .env            # completar claves (DB_PASSWORD, JWT_SECRET, IA_API_KEY de Groq opcional)
docker compose --profile app up -d --build
```

- Frontend: `http://localhost:3000` · API: `http://localhost:8080/api` · pgAdmin: `http://localhost:5050`
- Cada Pull Request a `main` ejecuta GitHub Actions: compila, prueba el backend y construye el frontend.
