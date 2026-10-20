# Sistema Hotel Princes Ica

Sistema web para la gestión del Hotel Princes Ica: habitaciones, huéspedes, reservas, check-in/check-out, consumos, pagos y limpieza.

| Capa | Tecnología |
| --- | --- |
| Backend | Spring Boot 4.1 · Java 21 · Spring Data JPA |
| Base de datos | PostgreSQL 16 (Docker) |
| Frontend | Next.js 16 · React 19 · Tailwind CSS 4 |

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

Definir `ANTHROPIC_API_KEY` en `.env` para que el asistente redacte con IA. Sin clave funciona con reglas fijas. El asistente solo sugiere; nunca reserva ni cambia estados por sí mismo.

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
