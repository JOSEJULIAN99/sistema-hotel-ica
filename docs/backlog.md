# Product Backlog

| Issue | Historia de usuario | Rama | Sprint | Criterio de aceptación |
| --- | --- | --- | --- | --- |
| HPI-01 | Como equipo quiero un diagnóstico para priorizar las mejoras | `docs/diagnostico-alcance` | S1 | Hallazgos y alcance aprobados |
| HPI-02 | Como desarrollador quiero un repositorio limpio y configurable | `chore/limpieza-repositorio` | S1 | Sin `target/`, con `.env.example` y README |
| HPI-03 | Como equipo quiero el modelo TO-BE documentado | `docs/diseno-tobe` | S1 | Flujos y roles revisados |
| HPI-04 | Como administrador quiero que solo el personal autorizado acceda | `feature/seguridad-jwt` | S2 | Token JWT, BCrypt y rutas por rol |
| HPI-05 | Como recepcionista quiero que no se dupliquen reservas ni check-in | `fix/reglas-reservas-checkin` | S2 | Solapamiento y estados validados |
| HPI-06 | Como usuario quiero ver el error real y datos reales | `fix/integracion-frontend` | S3 | Sin éxito simulado; reportes desde la API |
| HPI-07 | Como cajero quiero totales correctos y estadías cerradas bloqueadas | `fix/pagos-consumos-limpieza` | S3 | Totales al día; ALTA antes que MEDIA |
| HPI-08 | Como recepcionista quiero sugerencias de habitación con IA | `feature/asistente-ia` | S4 | Recomendador, resumen y priorización |
| HPI-09 | Como equipo quiero pruebas automáticas de las reglas | `test/pruebas-integracion` | S5 | `mvnw test` en verde |
| HPI-10 | Como hotel quiero el sistema publicado y al personal capacitado | `chore/despliegue-ci` | S5 | Pipeline verde y manual de uso |
| HPI-11 | Como equipo quiero levantar todo con Docker y claves en `.env` | `chore/docker-entorno` | S1 | `docker compose up` en una PC nueva |
| HPI-12 | Como administrador quiero subir fotos de habitaciones | `feature/supabase-storage` | S2 | Foto visible en la web pública |
| HPI-13 | Como huésped quiero resolver dudas a cualquier hora y en mi idioma | `feature/ia-llama-conocimiento` | S4 | Chatbot y traductor con datos del admin |
| HPI-14 | Como administrador quiero subir precios en fechas de alta demanda | `feature/tarifas-dinamicas` | S5 | Recomendación aprobada cambia el precio |
| HPI-15 | Como limpieza quiero recibir avisos al instante | `feature/avisos-incidencias` | S3 | Aviso llega sin recargar |
| HPI-16 | Como huésped quiero pagar en línea de forma segura | `feature/pagos-mercadopago` | S4 | Pago sandbox aprobado registrado solo |
| HPI-17 | Como administrador quiero monitorear el sistema | `feature/monitoreo-panel` | S4 | Panel con servicios y actividad |
| HPI-18 | Como equipo quiero los requisitos y costos en el repositorio | `docs/requisitos-costos` | S7 | Documento revisado |
