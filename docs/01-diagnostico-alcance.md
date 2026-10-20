# Diagnóstico y alcance — Sistema Hotel Princes Ica

Issue: HPI-01 · Sprint S1 · Rama `docs/diagnostico-alcance`

## 1. Situación actual (AS-IS)

Base revisada: rama `main`, commit `7397636`.

| Componente | Tecnología | Estado |
| --- | --- | --- |
| Backend | Spring Boot 4.1, Java 21, JPA | 9 controladores REST bajo `/api` |
| Base de datos | PostgreSQL 16 (Docker) | `init.sql` + `ddl-auto=update` |
| Frontend | Next.js 16, React 19, Tailwind 4 | Panel por roles y web pública de reservas |
| Seguridad | Spring Security | Todo con `permitAll()`; roles solo en `localStorage` |
| Calidad | Maven | Un solo test (`contextLoads`) |

## 2. Hallazgos priorizados

| ID | Severidad | Hallazgo | Ubicación | Issue que lo resuelve |
| --- | --- | --- | --- | --- |
| H01 | Crítica | API sin autenticación ni autorización por rol | `config/SecurityConfig.java` | HPI-04 |
| H02 | Crítica | Contraseñas en texto plano (BD, código y frontend) | `UsuarioServiceImpl`, `init.sql`, `lib/auth.js` | HPI-04 |
| H03 | Crítica | Spring Data REST expone entidades con contraseña | `pom.xml` | HPI-04 |
| H04 | Crítica | El fallback local simula éxito ante errores 400; login acepta usuarios desactivados | `frontend/lib/api.js`, `frontend/lib/auth.js` | HPI-06 |
| H05 | Crítica | Reportes, transacciones y almacén leen solo `localStorage` | `frontend/app/VistaPersonal/*` | HPI-06 |
| H06 | Alta | Reservas sin control de solapamiento | `ReservacionServiceImpl.crear` | HPI-05 |
| H07 | Alta | Check-in con reserva no valida habitación ni reserva en curso | `EstadiaServiceImpl.realizarCheckIn` | HPI-05 |
| H08 | Alta | Reserva del día pisa el estado OCUPADA | `ReservacionServiceImpl.crear` | HPI-05 |
| H09 | Media | Totales desactualizados en la respuesta de check-in y consumos | `EstadiaServiceImpl` | HPI-07 |
| H10 | Media | Prioridad de limpieza ordenada alfabéticamente | `TareaLimpiezaRepository` | HPI-07 |
| H11 | Media | Pagos y consumos editables en estadías finalizadas | `PagoServiceImpl`, `ConsumoServicioServiceImpl` | HPI-07 |
| H12 | Media | Errores 500 devuelven el mensaje interno | `GlobalExceptionHandler` | HPI-04 |
| H13 | Baja | `.gitignore`/README vacíos, `target/` versionado, dependencias sin uso | raíz | HPI-02 |

## 3. Alcance de la mejora

| Módulo | Entregable |
| --- | --- |
| Base técnica | `.gitignore`, README, variables de entorno, dependencias depuradas |
| Seguridad | BCrypt, JWT, permisos por rol |
| Reservas y check-in | Solapamiento, estado de habitación, transiciones válidas |
| Pagos, consumos y limpieza | Totales correctos, bloqueos, prioridad bien ordenada |
| Integración frontend | Fallback solo ante caída de red; pantallas con datos reales |
| Asistente IA | Recomendador, resumen diario, priorización de limpieza |
| Pruebas | Unitarias de reglas críticas y contexto con H2 |
| Publicación | GitHub Actions, Docker y capacitación |

Supuestos: una sede, cuatro roles, sin facturación electrónica ni pasarela de pago; la IA solo sugiere.
