-- ==========================================================
-- SCRIPT DE BASE DE DATOS: HOTEL PRINCES ICA
-- Motor: PostgreSQL 15+ / 16+
-- Codificación: UTF8
-- ==========================================================

-- Limpieza segura de tablas previas en caso de reinicio
DROP TABLE IF EXISTS pagos CASCADE;
DROP TABLE IF EXISTS consumos_servicios CASCADE;
DROP TABLE IF EXISTS tareas_limpieza CASCADE;
DROP TABLE IF EXISTS estadias CASCADE;
DROP TABLE IF EXISTS reservaciones CASCADE;
DROP TABLE IF EXISTS habitaciones CASCADE;
DROP TABLE IF EXISTS huespedes CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;

-- ==========================================================
-- 1. TABLA: usuarios (Personal del Hotel)
-- ==========================================================
CREATE TABLE usuarios (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    nombre_completo VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    telefono VARCHAR(20),
    rol VARCHAR(30) NOT NULL,
    turno VARCHAR(30),
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================================
-- 2. TABLA: habitaciones (Habitaciones y Estados)
-- ==========================================================
CREATE TABLE habitaciones (
    id BIGSERIAL PRIMARY KEY,
    numero VARCHAR(10) NOT NULL UNIQUE,
    piso INT NOT NULL,
    tipo VARCHAR(30) NOT NULL,
    precio_por_noche DECIMAL(10,2) NOT NULL,
    capacidad INT NOT NULL,
    estado VARCHAR(30) NOT NULL DEFAULT 'DISPONIBLE',
    descripcion TEXT,
    caracteristicas VARCHAR(255),
    imagen_url VARCHAR(500),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================================
-- 3. TABLA: huespedes (Clientes y Huéspedes)
-- ==========================================================
CREATE TABLE huespedes (
    id BIGSERIAL PRIMARY KEY,
    nombres VARCHAR(80) NOT NULL,
    apellidos VARCHAR(80) NOT NULL,
    tipo_documento VARCHAR(30) NOT NULL,
    numero_documento VARCHAR(30) NOT NULL UNIQUE,
    telefono VARCHAR(20),
    email VARCHAR(100),
    nacionalidad VARCHAR(60) DEFAULT 'Peruana',
    ciudad_procedencia VARCHAR(150),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================================
-- 4. TABLA: reservaciones
-- ==========================================================
CREATE TABLE reservaciones (
    id BIGSERIAL PRIMARY KEY,
    codigo_reserva VARCHAR(20) NOT NULL UNIQUE,
    huesped_id BIGINT NOT NULL REFERENCES huespedes(id) ON DELETE CASCADE,
    habitacion_id BIGINT NOT NULL REFERENCES habitaciones(id) ON DELETE CASCADE,
    fecha_entrada DATE NOT NULL,
    fecha_salida DATE NOT NULL,
    numero_personas INT NOT NULL,
    precio_total DECIMAL(10,2) NOT NULL,
    adelanto DECIMAL(10,2) DEFAULT 0.00,
    estado VARCHAR(30) NOT NULL DEFAULT 'PENDIENTE',
    observaciones TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================================
-- 5. TABLA: estadias (Check-In y Ocupación Activa)
-- ==========================================================
CREATE TABLE estadias (
    id BIGSERIAL PRIMARY KEY,
    reservacion_id BIGINT REFERENCES reservaciones(id) ON DELETE SET NULL,
    huesped_id BIGINT NOT NULL REFERENCES huespedes(id) ON DELETE CASCADE,
    habitacion_id BIGINT NOT NULL REFERENCES habitaciones(id) ON DELETE CASCADE,
    fecha_ingreso TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_salida_esperada DATE NOT NULL,
    fecha_salida_real TIMESTAMP WITHOUT TIME ZONE,
    total_hospedaje DECIMAL(10,2) NOT NULL,
    total_consumos DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    descuento DECIMAL(10,2) DEFAULT 0.00,
    total_pagar DECIMAL(10,2) NOT NULL,
    estado VARCHAR(30) NOT NULL DEFAULT 'ACTIVA',
    observaciones TEXT
);

-- ==========================================================
-- 6. TABLA: consumos_servicios (Consumos en Estadía)
-- ==========================================================
CREATE TABLE consumos_servicios (
    id BIGSERIAL PRIMARY KEY,
    estadia_id BIGINT NOT NULL REFERENCES estadias(id) ON DELETE CASCADE,
    nombre_servicio VARCHAR(100) NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    fecha_consumo TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================================
-- 7. TABLA: pagos (Comprobantes y Pagos Registrados)
-- ==========================================================
CREATE TABLE pagos (
    id BIGSERIAL PRIMARY KEY,
    estadia_id BIGINT NOT NULL REFERENCES estadias(id) ON DELETE CASCADE,
    monto DECIMAL(10,2) NOT NULL,
    metodo_pago VARCHAR(30) NOT NULL,
    fecha_pago TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    nro_operacion VARCHAR(50),
    tipo_comprobante VARCHAR(30),
    nro_comprobante VARCHAR(30),
    notas VARCHAR(255)
);

-- ==========================================================
-- 8. TABLA: tareas_limpieza
-- ==========================================================
CREATE TABLE tareas_limpieza (
    id BIGSERIAL PRIMARY KEY,
    habitacion_id BIGINT NOT NULL REFERENCES habitaciones(id) ON DELETE CASCADE,
    empleado_id BIGINT REFERENCES usuarios(id) ON DELETE SET NULL,
    tipo_limpieza VARCHAR(50) DEFAULT 'RUTINARIA',
    estado VARCHAR(30) NOT NULL DEFAULT 'PENDIENTE',
    prioridad VARCHAR(30) NOT NULL DEFAULT 'MEDIA',
    observaciones TEXT,
    fecha_creacion TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_inicio TIMESTAMP WITHOUT TIME ZONE,
    fecha_fin TIMESTAMP WITHOUT TIME ZONE
);

-- ==========================================================
-- INSERCIÓN DE DATOS INICIALES REALES (SIN DATOS FANTASMAS)
-- ==========================================================

-- 1. Usuarios del Sistema
INSERT INTO usuarios (id, username, password, nombre_completo, email, telefono, rol, turno, activo, created_at) VALUES
(1, 'admin', 'admin123', 'Administrador General', 'admin@hotelprincesica.com', '999888777', 'ADMINISTRADOR', 'General', TRUE, NOW()),
(2, 'pluna', 'hotel123', 'Pablo Luna', 'pluna@hotelprincesica.com', '956123456', 'RECEPCIONISTA', 'Turno Tarde', TRUE, NOW()),
(3, 'mgomez', 'hotel123', 'María Gómez', 'mgomez@hotelprincesica.com', '956789123', 'RECEPCIONISTA', 'Turno Mañana', TRUE, NOW()),
(4, 'rflores', 'hotel123', 'Rosa Flores', 'rflores@hotelprincesica.com', '956321654', 'LIMPIEZA', 'Turno Mañana', TRUE, NOW());

-- 2. Habitaciones Reales del Hotel Princes Ica
INSERT INTO habitaciones (id, numero, piso, tipo, precio_por_noche, capacidad, estado, descripcion, caracteristicas, imagen_url, created_at, updated_at) VALUES
(1, '101', 1, 'INDIVIDUAL', 90.00, 1, 'DISPONIBLE', 'Habitación simple acogedora con cama de 1.5 plazas, baño privado y aire acondicionado.', 'WiFi 5G, Smart TV 43", Aire Acondicionado, Ducha Caliente', 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80', NOW(), NOW()),
(2, '102', 1, 'DOBLE', 140.00, 2, 'OCUPADA', 'Habitación doble con 2 camas de 1.5 plazas, ideal para viajeros o amigos.', 'WiFi 5G, Smart TV 50", A/C, Frigobar, Escritorio', 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80', NOW(), NOW()),
(3, '103', 1, 'MATRIMONIAL', 160.00, 2, 'LIMPIEZA', 'Habitación matrimonial con cama Queen Size y vista al jardín interior.', 'Cama Queen, WiFi 5G, Smart TV 55", Frigobar, A/C', 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80', NOW(), NOW()),
(4, '201', 2, 'MATRIMONIAL', 170.00, 2, 'DISPONIBLE', 'Habitación matrimonial superior en segundo piso con balcón hacia la campiña.', 'Balcón Privado, Cama King, WiFi 5G, TV 55", Frigobar, A/C', 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80', NOW(), NOW()),
(5, '202', 2, 'SUITE', 240.00, 2, 'RESERVADA', 'Suite Deluxe con jacuzzi privado y vista panorámica a la piscina y oasis.', 'Jacuzzi Privado, Sala de Estar, Cama King, Frigobar Premium, WiFi 5G', 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80', NOW(), NOW()),
(6, '203', 2, 'FAMILIAR', 260.00, 4, 'DISPONIBLE', 'Habitación espaciosa para familias con 1 cama matrimonial y 2 camas individuales.', '2 Ambientes, 2 Baños, Smart TV x2, Frigobar, A/C, WiFi 5G', 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80', NOW(), NOW()),
(7, '301', 3, 'SUITE', 320.00, 3, 'DISPONIBLE', 'Suite Presidencial con terraza privada, jacuzzi exterior y vista a la puesta de sol de Huacachina.', 'Terraza Privada, Jacuzzi Panorámico, Cama Super King, Bar Integrado, WiFi 5G', 'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=800&q=80', NOW(), NOW()),
(8, '302', 3, 'DOBLE', 150.00, 2, 'MANTENIMIENTO', 'Habitación doble en mantenimiento preventivo de aire acondicionado.', '2 Camas, WiFi 5G, TV 50"', 'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?auto=format&fit=crop&w=800&q=80', NOW(), NOW());

-- 3. Huéspedes Registrados
INSERT INTO huespedes (id, nombres, apellidos, tipo_documento, numero_documento, telefono, email, nacionalidad, ciudad_procedencia, created_at) VALUES
(1, 'Juan Carlos', 'Pérez Morales', 'DNI', '45892134', '987654321', 'juan.perez@gmail.com', 'Peruana', 'Lima', NOW()),
(2, 'Ana Lucía', 'Mendoza Vargas', 'DNI', '72415689', '954321987', 'ana.mendoza@hotmail.com', 'Peruana', 'Arequipa', NOW()),
(3, 'Roberto Carlos', 'Silva Fernandez', 'PASAPORTE', 'AB928172', '+56912345678', 'roberto.silva@outlook.com', 'Chilena', 'Santiago de Chile', NOW());

-- 4. Reservación Activa (Para Habitación 202)
INSERT INTO reservaciones (id, codigo_reserva, huesped_id, habitacion_id, fecha_entrada, fecha_salida, numero_personas, precio_total, adelanto, estado, observaciones, created_at) VALUES
(1, 'RES-2026-001', 3, 5, CURRENT_DATE, CURRENT_DATE + INTERVAL '2 day', 2, 480.00, 200.00, 'CONFIRMADA', 'Huésped solicita late check-in a las 7:00 PM y cuna para infante', NOW());

-- 5. Estadía Activa (Habitación 102 con Juan Pérez)
INSERT INTO estadias (id, reservacion_id, huesped_id, habitacion_id, fecha_ingreso, fecha_salida_esperada, fecha_salida_real, total_hospedaje, total_consumos, descuento, total_pagar, estado, observaciones) VALUES
(1, NULL, 1, 2, NOW() - INTERVAL '1 day', CURRENT_DATE + INTERVAL '1 day', NULL, 280.00, 35.00, 0.00, 315.00, 'ACTIVA', 'Huésped solicita toallas adicionales por la mañana');

-- 6. Consumos de la Estadía 1
INSERT INTO consumos_servicios (id, estadia_id, nombre_servicio, cantidad, precio_unitario, subtotal, fecha_consumo) VALUES
(1, 1, 'Pisco Sour Queirolo (Bar)', 1, 25.00, 25.00, NOW() - INTERVAL '5 hour'),
(2, 1, 'Agua Mineral San Mateo 1L', 2, 5.00, 10.00, NOW() - INTERVAL '3 hour');

-- 7. Pagos Realizados en la Estadía 1
INSERT INTO pagos (id, estadia_id, monto, metodo_pago, fecha_pago, nro_operacion, tipo_comprobante, nro_comprobante, notas) VALUES
(1, 1, 150.00, 'YAPE', NOW() - INTERVAL '1 day', 'YAPE-948210', 'BOLETA', 'B001-000101', 'Pago de adelanto / Check-in');

-- 8. Tarea de Limpieza (Habitación 103 pendiente para Rosa)
INSERT INTO tareas_limpieza (id, habitacion_id, empleado_id, tipo_limpieza, estado, prioridad, observaciones, fecha_creacion, fecha_inicio, fecha_fin) VALUES
(1, 3, 4, 'CHECKOUT', 'PENDIENTE', 'ALTA', 'Check-out realizado hoy. Requiere cambio de sábanas y desinfección completa.', NOW() - INTERVAL '2 hour', NULL, NULL);

-- Ajustar secuencias automáticas de IDs en PostgreSQL
SELECT setval(pg_get_serial_sequence('usuarios', 'id'), COALESCE(MAX(id), 1)) FROM usuarios;
SELECT setval(pg_get_serial_sequence('habitaciones', 'id'), COALESCE(MAX(id), 1)) FROM habitaciones;
SELECT setval(pg_get_serial_sequence('huespedes', 'id'), COALESCE(MAX(id), 1)) FROM huespedes;
SELECT setval(pg_get_serial_sequence('reservaciones', 'id'), COALESCE(MAX(id), 1)) FROM reservaciones;
SELECT setval(pg_get_serial_sequence('estadias', 'id'), COALESCE(MAX(id), 1)) FROM estadias;
SELECT setval(pg_get_serial_sequence('consumos_servicios', 'id'), COALESCE(MAX(id), 1)) FROM consumos_servicios;
SELECT setval(pg_get_serial_sequence('pagos', 'id'), COALESCE(MAX(id), 1)) FROM pagos;
SELECT setval(pg_get_serial_sequence('tareas_limpieza', 'id'), COALESCE(MAX(id), 1)) FROM tareas_limpieza;
