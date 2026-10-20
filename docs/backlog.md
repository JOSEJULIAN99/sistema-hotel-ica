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
