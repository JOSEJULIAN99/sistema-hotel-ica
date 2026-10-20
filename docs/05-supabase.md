# Supabase: evaluación y conexión

Issue: HPI-12 · Rama `feature/supabase-storage`

## 1. Decisión

| Criterio | PostgreSQL en Docker | Supabase Free | Supabase Pro |
| --- | --- | --- | --- |
| Costo | S/ 0 | S/ 0 | US$ 25 al mes |
| Base de datos | Disco del equipo | 500 MB | 8 GB |
| Archivos (fotos) | Disco del servidor | 1 GB | 100 GB |
| Pausa por inactividad | No | Tras 1 semana sin uso | No |
| Uso | Desarrollo | Demo y primer año del hotel | Crecimiento |

Se desarrolla con PostgreSQL en Docker y se publica con Supabase Free. El backend no cambia de código: solo variables del `.env`.

## 2. Crear el proyecto (5 minutos)

1. En supabase.com crear un proyecto (región São Paulo, la más cercana a Perú) y guardar la clave de la base de datos.
2. **Base de datos:** Project Settings → Database → Connection string → **Session pooler** (IPv4, puerto 5432). La conexión directa usa IPv6 y muchos contenedores Docker no la tienen.
3. **Fotos:** Storage → New bucket → nombre `habitaciones`, marcar **Public bucket**.
4. **Clave del backend:** Project Settings → API → `service_role`. Solo va en el `.env` del backend; nunca en el frontend ni en GitHub.

## 3. Variables en `.env`

```properties
DB_URL=jdbc:postgresql://aws-0-<region>.pooler.supabase.com:5432/postgres?sslmode=require
DB_USER=postgres.<project-ref>
DB_PASSWORD=<clave de la base de datos>
DB_URL_DOCKER=
DB_POOL_SIZE=5

STORAGE_TIPO=supabase
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service_role>
SUPABASE_BUCKET=habitaciones
```

Levantar sin la base local: `docker compose up -d --build`. Al iniciar, Hibernate crea las tablas (`DDL_AUTO=update`) y `DataInitializer` carga los datos de ejemplo si la base está vacía. El script `database/init.sql` solo se usa con PostgreSQL local.

## 4. Verificación

1. `docker compose logs backend` muestra `Fotos en Supabase Storage, bucket 'habitaciones'`.
2. En el panel, Rack de Habitaciones → editar → **Subir imagen** → Guardar.
3. La foto aparece en Storage → habitaciones y en la página pública del hotel.

## 5. Riesgos

- **Pausa del plan Free:** con uso diario no ocurre; si el proyecto se pausa, se reactiva desde el panel de Supabase.
- **Respaldo:** programar un `pg_dump` diario desde el VPS (`pg_dump "$DB_URL" > respaldo-$(date +%F).sql`, usando la cadena en formato `postgresql://`).
- **Conexiones:** el plan Free admite pocas conexiones simultáneas; por eso `DB_POOL_SIZE=5`.
