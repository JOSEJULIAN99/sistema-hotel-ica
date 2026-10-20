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

## Puesta en marcha

1. Copiar las variables de entorno y completar las claves:

   ```bash
   cp .env.example .env
   cp frontend/.env.example frontend/.env.local
   ```

2. Levantar la base de datos:

   ```bash
   docker compose up -d db
   ```

3. Ejecutar el backend (puerto 8080):

   ```bash
   ./mvnw spring-boot:run
   ```

4. Ejecutar el frontend (puerto 3000):

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## Todo con Docker

```bash
cp .env.example .env
docker compose --profile app up -d --build
```

Frontend en `http://localhost:3000`, API en `http://localhost:8080/api`.

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
