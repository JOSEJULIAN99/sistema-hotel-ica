# Sistema Hotel Princes Ica

Sistema web para la gestión del Hotel Princes Ica: habitaciones, huéspedes, reservas, check-in/check-out, consumos, pagos y limpieza.

| Capa | Tecnología |
| --- | --- |
| Backend | Spring Boot 4.1 · Java 21 · Spring Data JPA |
| Base de datos | PostgreSQL 16 (Docker) |
| Frontend | Next.js 16 · React 19 · Tailwind CSS 4 |

## Funciones principales

- Reservas sin solapamiento, check-in/check-out, consumos y pagos por estadía
- Roles (administrador, gerente, recepción, limpieza) con JWT y contraseñas BCrypt
- Avisos instantáneos a limpieza e historial de incidencias de mantenimiento
- Pagos en línea con Mercado Pago (modo prueba)
- IA libre (Llama): chatbot 24/7 para huéspedes, traducción y asistente de recepción
- Tarifas dinámicas por feriados, festividades de Ica y ocupación, con aprobación e historial
- Fotos de habitaciones en Supabase Storage y panel de monitoreo
- Web pública con banner, buscador por fechas y disponibilidad real
- Cuentas de clientes (registro, "Mis reservas", pago y cancelación) separadas del ingreso del personal
- Personal creado solo por el administrador (módulo Usuarios); validación de documentos, celular y fechas

## Accesos de prueba

| Dónde | Usuario | Contraseña |
| --- | --- | --- |
| Panel del personal `/VistaPersonal/login` | `admin` (también `pluna`, `mgomez`, `rflores` con `hotel123`) | `admin123` |
| Web del cliente `/cuenta` | `cliente@demo.com` | `cliente123` |

La cuenta de cliente de demostración se crea sola si no hay clientes; se desactiva con `APP_CLIENTE_DEMO=false`. Para usar una foto real en el banner, guárdela como `frontend/public/portada.jpg`.

Documentación en `docs/`: diagnóstico, modelo TO-BE, requisitos y costos, Supabase y Mercado Pago.

## Requisitos

- Java 21 y Docker Desktop
- Node.js 20 o superior

## Puesta en marcha con Docker (recomendado)

Solo se necesita Docker Desktop. Funciona igual en Windows, Linux y Mac.

1. Copiar las variables y completar las claves (el archivo `.env` está en `.gitignore`):

   ```bash
   cp .env.example .env
   ```

2. Elegir la base de datos y levantar todo:

   | Caso | Comando |
   | --- | --- |
   | PostgreSQL local en Docker | `docker compose --profile local up -d --build` |
   | Supabase (completar `DB_URL`, `DB_USER`, `DB_PASSWORD` y dejar `DB_URL_DOCKER=` vacío) | `docker compose up -d --build` |
   | Además IA local con Llama (Ollama) | agregar `--profile ia-local` |
   | Además pgAdmin en `http://localhost:5050` | agregar `--profile herramientas` |

3. Abrir el frontend en `http://localhost:3000` y el API en `http://localhost:8080/api`.

Comandos útiles: `docker compose logs -f backend`, `docker compose down` (detener), `docker compose down -v` (detener y borrar datos locales).

## Ejecutar sin Docker (desarrollo)

Requiere Java 21 y Node.js 20 o superior. El backend lee el mismo `.env` de la raíz.

```bash
docker compose --profile local up -d db     # solo la base de datos
./mvnw spring-boot:run                      # backend en el puerto 8080
cd frontend && npm install && npm run dev   # frontend en el puerto 3000
```

## Pruebas

```bash
./mvnw test
```

Las pruebas usan H2 en memoria; no necesitan PostgreSQL. GitHub Actions las ejecuta en cada Pull Request.

## Asistente IA

La IA es **Llama**, un modelo libre, y se elige en `.env`:

| `IA_PROVEEDOR` | Qué usa | Requisito |
| --- | --- | --- |
| `groq` | Llama 3.3 70B en la nube (capa gratuita) | Crear una API key en console.groq.com y ponerla en `IA_API_KEY` |
| `ollama` | Llama 3.2 en tu PC | Levantar con `--profile ia-local` (descarga ~2 GB la primera vez) |
| `ninguno` | Sin IA | Todo funciona con respuestas por reglas |

El administrador alimenta la IA desde **Configuración IA** en el panel (datos del hotel, servicios, políticas, turismo y reglas). La IA solo sugiere y responde; nunca reserva ni cambia estados por sí misma.

## Estructura

```
src/main/java/com/Sistema/hoteleria/
  config/       seguridad y datos iniciales
  controller/   endpoints REST bajo /api
  service/      reglas de negocio
  repository/   acceso a datos (JPA)
  model/        entidades y enumeraciones
  dto/          objetos de transferencia
frontend/       aplicación Next.js
database/       script de inicialización de PostgreSQL
docs/           diagnóstico, modelo TO-BE y backlog
```

## Flujo de trabajo

Se usa GitHub Flow: `main` protegida y una rama corta por Issue (`feature/`, `fix/`, `docs/`, `chore/`, `test/`), integrada por Pull Request revisado. Ver `docs/backlog.md`.
