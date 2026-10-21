# Mercado Pago: pasarela de pago en modo prueba

Issue: HPI-16 · Rama `feature/pagos-mercadopago` · RF-03

## Flujo

1. Recepción pulsa **Cobrar con Mercado Pago** en una estadía (o el huésped elige pagar su reserva en la web).
2. El backend crea una *preferencia* de Checkout Pro y devuelve el link de pago.
3. El huésped paga con tarjeta o billetera en la página de Mercado Pago.
4. Mercado Pago avisa por webhook y el huésped vuelve a `/pago/resultado`.
5. En ambos casos el backend **consulta el pago a la API de Mercado Pago**; solo si está `approved` y el monto coincide registra el Pago (estadía) o el adelanto (reserva). Es idempotente: una notificación repetida no duplica el cobro.

## Configuración en `.env`

```properties
MP_MODO=prueba                     # prueba = sin dinero real; produccion = cobros reales
MP_ACCESS_TOKEN=APP_USR-xxxxxxxx   # credencial de prueba (TEST-... o APP_USR-... de una cuenta de prueba)
MP_WEBHOOK_SECRET=                 # opcional: valida la firma x-signature
APP_FRONTEND_URL=http://localhost:3000
APP_BACKEND_PUBLIC_URL=            # URL https pública del backend para el webhook
```

- Credenciales: mercadopago.com.pe/developers → Tus integraciones → crear aplicación → Credenciales de prueba. Mercado Pago entrega hoy credenciales de prueba que empiezan con `APP_USR-`; por eso el modo lo decide `MP_MODO` y no el prefijo. Solo se usa el **Access Token**; la Public Key no hace falta con Checkout Pro.
- Nunca se comparte el Access Token por chat ni se sube a GitHub: va solo en `.env`. Si se filtra, se regenera en la misma pantalla.
- Para probar compras se usan **usuarios de prueba** (comprador) y las tarjetas de prueba que publica Mercado Pago.
- En local el webhook no llega (no hay URL pública): la verificación ocurre al volver a `/pago/resultado`. Con un túnel HTTPS (por ejemplo ngrok) se puede completar `APP_BACKEND_PUBLIC_URL`.

## Costos

Sin mensualidad. Mercado Pago cobra una comisión por transacción con tarjeta (entre 3.99 % y 4.99 % + IGV en Perú, según el plazo de liberación del dinero); la asume el hotel en cada cobro.

## Paso a producción

Cambiar `MP_ACCESS_TOKEN` por la credencial productiva (`APP_USR-...`) de la cuenta del hotel, poner `MP_MODO=produccion` y definir `APP_BACKEND_PUBLIC_URL` y `MP_WEBHOOK_SECRET`. No se cambia código.
