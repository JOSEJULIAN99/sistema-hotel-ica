# Requisitos, objetivos y costos — Sistema Hotel Princes Ica

Issue: HPI-18 · Rama `docs/requisitos-costos`

Equipo: Altamirano Ramos Sebastian Jared, Canchari Bedon Junior Alonso, Pacheco Ccahuana Jose Julian y Verastegui Perez Sofía.

## 1. Propuesta y problemática

Sistema web de gestión hotelera adaptado a la demanda turística y comercial de Ica que centraliza huéspedes, reservas, pagos, asignación de habitaciones, limpieza y mantenimiento, con acceso por roles y pasarela de pago segura.

| Problema en Ica | Respuesta del sistema | RF |
| --- | --- | --- |
| Consumos anotados en papel que se pierden antes del check-out | Consumos en la cuenta de la habitación; check-out con saldo en cero | RF-02, RF-04 |
| Habitaciones sucias asignadas por falta de comunicación | Estado en tiempo real y avisos instantáneos a limpieza | RF-05, RF-06 |
| Colapso en temporada alta (Vendimia, Semana Santa) | Chatbot 24/7 y tarifas dinámicas por eventos y ocupación | RF-10, RF-12 |
| Turistas extranjeros que no hablan español | Traducción automática con IA | RF-11 |

## 2. Objetivos

**General.** Desarrollar un sistema web de gestión hotelera adaptado a la demanda turística de Ica, que automatice reservas, recepción, limpieza y pagos, e incorpore un motor de tarifas dinámicas y un asistente de IA para optimizar la rentabilidad y la experiencia del cliente.

| Específico | Indicador |
| --- | --- |
| Reducir tiempos de atención | Check-in en menos de 3 minutos en temporada alta |
| Maximizar la ocupación y disponibilidad | 0 dobles reservas; estado de habitación al instante |
| Garantizar transacciones seguras | 100 % de pagos en línea registrados sin digitación manual |
| Aumentar la productividad operativa | Habitación liberada notificada en segundos |
| Asegurar la integridad de la información | 0 accesos fuera del rol en pruebas |
| Facilitar el análisis financiero | Métricas del día en el panel sin reportes manuales |

## 3. Requerimientos funcionales

| ID | Requerimiento | Descripción | Rama |
| --- | --- | --- | --- |
| RF-01 | Gestión de reservas | Disponibilidad, registro, modificación y cancelación sin solapamiento; reserva web | 5, 6 |
| RF-02 | Check-in / Check-out | Asignación al ingreso; consolidación de consumos; saldo cero al salir | 5, 7 |
| RF-03 | Procesamiento de pagos | Mercado Pago validado por webhook; efectivo, Yape y Plin en recepción | 16 |
| RF-04 | Gestión de consumos | Minibar, restaurante y servicios en la cuenta de la habitación | 7 |
| RF-05 | Control de habitaciones | Disponible, reservada, ocupada, limpieza o mantenimiento en tiempo real | 5, 7 |
| RF-06 | Gestión de limpieza | Tareas con prioridad y avisos instantáneos desde recepción | 7, 15 |
| RF-07 | Usuarios y roles | Cuentas del personal creadas por el administrador; sin auto-registro de trabajadores | 4, 20 |
| RF-08 | Mantenimiento e incidencias | Reporte, bloqueo de habitación e historial | 15 |
| RF-09 | Reportes y métricas | Ingresos, ocupación y flujo de huéspedes | 6 |
| RF-10 | Asistente virtual con IA | Chatbot 24/7 con preguntas frecuentes y turismo de Ica | 13 |
| RF-11 | Traducción automática | Mensajes de turistas y respuestas del personal | 13 |
| RF-12 | Tarifas dinámicas | Subidas por feriados, festividades, eventos u ocupación, con aprobación e historial | 14 |
| RF-13 | Base de conocimiento | Información y reglas del negocio que usa la IA, con valores por defecto | 13 |
| RF-14 | Imágenes de habitaciones | Subida desde el panel a Supabase Storage | 12 |
| RF-15 | Monitoreo y auditoría | Estado de servicios, actividad del personal y errores | 17 |
| RF-16 | Asistente interno | Recomendar habitación, resumir el día y ordenar la limpieza | 8 |
| RF-17 | Cuentas de clientes | Registro e ingreso propios del cliente; ve, paga y cancela solo sus reservas | 19 |
| RF-18 | Gestión del personal | Pantalla Usuarios: alta, rol, turno, activación y restablecimiento de contraseña | 20 |
| RF-19 | Disponibilidad por fechas | Buscador de la web con habitaciones libres y total de la estadía | 22 |
| RF-20 | Validación de datos | Documento según tipo, celular, nombres, fechas y noches, en formulario y servidor | 23 |

## 4. Requerimientos no funcionales

| ID | Atributo | Métrica |
| --- | --- | --- |
| RNF-01 | Seguridad | JWT, BCrypt, permisos en el backend; 0 claves en el repositorio |
| RNF-02 | Rendimiento | API < 2 s en el 95 % de peticiones |
| RNF-03 | Disponibilidad | 99 % mensual; sin IA o sin Mercado Pago el sistema sigue operando |
| RNF-04 | Usabilidad | Adaptable desde 360 px; check-in en 3 pasos o menos |
| RNF-05 | Portabilidad | `docker compose up` en Windows, Linux o Mac |
| RNF-06 | Mantenibilidad | Capas, GitHub Flow y Pull Request revisado |
| RNF-07 | Calidad | GitHub Actions en verde en cada PR |
| RNF-08 | Privacidad | Ley N.º 29733; la IA no recibe nombres ni documentos |
| RNF-09 | Escalabilidad | Supabase Free → Pro solo con variables de entorno |
| RNF-10 | Trazabilidad | Registro de cada escritura y de cada decisión de tarifa |
| RNF-11 | Multilenguaje | Chatbot en español, inglés y portugués |
| RNF-12 | Costo operativo | Servicios < S/ 1,300 al año |

## 5. Presupuesto (método ascendente, sin IGV)

Tarifas de nivel junior en Perú (S/ 10 a S/ 14 por hora). Tipo de cambio S/ 3.457 por dólar (12/10/2026).

| Concepto | Costo S/ |
| --- | --- |
| Personal técnico (810 h) | 10,160.00 |
| Gestión Scrum (60 h) | 720.00 |
| VPS Hetzner CPX22, 12 meses | 978.61 |
| Supabase Free y Groq (capa gratuita) | 0.00 |
| Reserva para IA de pago | 100.00 |
| Dominio .com | 41.48 |
| Materiales de capacitación | 60.00 |
| Contingencia 10 % | 1,206.01 |
| **Total** | **13,266.10** |

Escenarios: optimista S/ 11,520.69 · base S/ 13,266.10 · pesimista S/ 14,462.90. Todos bajo el tope de S/ 15,000. Mercado Pago no tiene mensualidad: cobra entre 3.99 % y 4.99 % + IGV por transacción, a cargo del hotel.

## 6. Plus del sistema

IA de ingresos hecha para Ica sin costo de licencias: Llama 3.3 libre aprende de la base de conocimiento del administrador, propone tarifas en feriados, festividades y ocupación alta, guarda cada decisión con su resultado real, atiende huéspedes 24/7 en su idioma y traduce mensajes. Con Ollama funciona sin internet; sin IA, todo sigue con reglas.
