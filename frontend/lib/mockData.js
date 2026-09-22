// Datos iniciales de prueba sincronizados con DataInitializer.java

export const INITIAL_HABITACIONES = [
  {
    id: 1,
    numero: "101",
    piso: 1,
    tipo: "INDIVIDUAL",
    precioPorNoche: 90.00,
    capacidad: 1,
    estado: "DISPONIBLE",
    descripcion: "Habitación simple acogedora con cama de 1.5 plazas, baño privado y aire acondicionado.",
    caracteristicas: "WiFi 5G, Smart TV 43\", Aire Acondicionado, Ducha Caliente",
    imagenUrl: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 2,
    numero: "102",
    piso: 1,
    tipo: "DOBLE",
    precioPorNoche: 140.00,
    capacidad: 2,
    estado: "OCUPADA",
    descripcion: "Habitación doble con 2 camas de 1.5 plazas, ideal para viajeros o amigos.",
    caracteristicas: "WiFi 5G, Smart TV 50\", A/C, Frigobar, Escritorio",
    imagenUrl: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 3,
    numero: "103",
    piso: 1,
    tipo: "MATRIMONIAL",
    precioPorNoche: 160.00,
    capacidad: 2,
    estado: "LIMPIEZA",
    descripcion: "Habitación matrimonial con cama Queen Size y vista al jardín interior.",
    caracteristicas: "Cama Queen, WiFi 5G, Smart TV 55\", Frigobar, A/C",
    imagenUrl: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 4,
    numero: "201",
    piso: 2,
    tipo: "MATRIMONIAL",
    precioPorNoche: 170.00,
    capacidad: 2,
    estado: "DISPONIBLE",
    descripcion: "Habitación matrimonial superior en segundo piso con balcón hacia la campiña iqueña.",
    caracteristicas: "Balcón Privado, Cama King, WiFi 5G, TV 55\", Frigobar, A/C",
    imagenUrl: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 5,
    numero: "202",
    piso: 2,
    tipo: "SUITE",
    precioPorNoche: 240.00,
    capacidad: 2,
    estado: "RESERVADA",
    descripcion: "Suite Deluxe con jacuzzi privado y vista panorámica a la piscina y oasis.",
    caracteristicas: "Jacuzzi Privado, Sala de Estar, Cama King, Frigobar Premium, WiFi 5G",
    imagenUrl: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 6,
    numero: "203",
    piso: 2,
    tipo: "FAMILIAR",
    precioPorNoche: 260.00,
    capacidad: 4,
    estado: "DISPONIBLE",
    descripcion: "Habitación espaciosa para familias con 1 cama matrimonial y 2 camas individuales.",
    caracteristicas: "2 Ambientes, 2 Baños, Smart TV x2, Frigobar, A/C, WiFi 5G",
    imagenUrl: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 7,
    numero: "301",
    piso: 3,
    tipo: "SUITE",
    precioPorNoche: 320.00,
    capacidad: 3,
    estado: "DISPONIBLE",
    descripcion: "Suite Presidencial con terraza privada, jacuzzi exterior y vista a la puesta de sol de Huacachina.",
    caracteristicas: "Terraza Privada, Jacuzzi Panorámico, Cama Super King, Bar Integrado, WiFi 5G",
    imagenUrl: "https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 8,
    numero: "302",
    piso: 3,
    tipo: "DOBLE",
    precioPorNoche: 150.00,
    capacidad: 2,
    estado: "MANTENIMIENTO",
    descripcion: "Habitación doble en mantenimiento preventivo de aire acondicionado.",
    caracteristicas: "2 Camas, WiFi 5G, TV 50\"",
    imagenUrl: "https://images.unsplash.com/photo-1595576508898-0ad5c879a061?auto=format&fit=crop&w=800&q=80"
  }
];

export const INITIAL_HUESPEDES = [
  {
    id: 1,
    nombres: "Juan Carlos",
    apellidos: "Pérez Morales",
    tipoDocumento: "DNI",
    numeroDocumento: "45892134",
    telefono: "987654321",
    email: "juan.perez@gmail.com",
    nacionalidad: "Peruana",
    ciudadProcedencia: "Lima"
  },
  {
    id: 2,
    nombres: "Ana Lucía",
    apellidos: "Mendoza Vargas",
    tipoDocumento: "DNI",
    numeroDocumento: "72415689",
    telefono: "954321987",
    email: "ana.mendoza@hotmail.com",
    nacionalidad: "Peruana",
    ciudadProcedencia: "Arequipa"
  },
  {
    id: 3,
    nombres: "Roberto Carlos",
    apellidos: "Silva Fernandez",
    tipoDocumento: "PASAPORTE",
    numeroDocumento: "AB928172",
    telefono: "+56912345678",
    email: "roberto.silva@outlook.com",
    nacionalidad: "Chilena",
    ciudadProcedencia: "Santiago de Chile"
  },
  {
    id: 4,
    nombres: "Carla Valentina",
    apellidos: "Rios Salazar",
    tipoDocumento: "DNI",
    numeroDocumento: "70129845",
    telefono: "945112233",
    email: "carla.rios@yahoo.com",
    nacionalidad: "Peruana",
    ciudadProcedencia: "Trujillo"
  }
];

export const INITIAL_RESERVACIONES = [
  {
    id: 1,
    codigoReserva: "RES-260916-001",
    huesped: INITIAL_HUESPEDES[2],
    habitacion: INITIAL_HABITACIONES[4],
    fechaEntrada: new Date().toISOString().split("T")[0],
    fechaSalida: new Date(Date.now() + 2 * 86400000).toISOString().split("T")[0],
    numeroPersonas: 2,
    precioTotal: 480.00,
    adelanto: 200.00,
    estado: "CONFIRMADA",
    observaciones: "Huésped solicita late check-in a las 7:00 PM y cuna para infante"
  },
  {
    id: 2,
    codigoReserva: "RES-260916-002",
    huesped: INITIAL_HUESPEDES[1],
    habitacion: INITIAL_HABITACIONES[3],
    fechaEntrada: new Date(Date.now() + 86400000).toISOString().split("T")[0],
    fechaSalida: new Date(Date.now() + 3 * 86400000).toISOString().split("T")[0],
    numeroPersonas: 2,
    precioTotal: 340.00,
    adelanto: 100.00,
    estado: "PENDIENTE",
    observaciones: "Pendiente confirmación de voucher de transferencia bancaria"
  }
];

export const INITIAL_ESTADIAS = [
  {
    id: 1,
    reservacionId: null,
    codigoReserva: "WALK-IN-001",
    huesped: INITIAL_HUESPEDES[0],
    habitacion: INITIAL_HABITACIONES[1],
    fechaIngreso: new Date(Date.now() - 86400000).toISOString(),
    fechaSalidaEsperada: new Date(Date.now() + 86400000).toISOString().split("T")[0],
    fechaSalidaReal: null,
    totalHospedaje: 280.00,
    totalConsumos: 35.00,
    descuento: 0.00,
    totalPagar: 315.00,
    totalPagado: 150.00,
    saldoPendiente: 165.00,
    estado: "ACTIVA",
    observaciones: "Huésped solicita toallas adicionales por la mañana",
    consumos: [
      {
        id: 1,
        estadiaId: 1,
        nombreServicio: "Pisco Sour Queirolo (Bar)",
        cantidad: 1,
        precioUnitario: 25.00,
        subtotal: 25.00,
        fechaConsumo: new Date(Date.now() - 5 * 3600000).toISOString()
      },
      {
        id: 2,
        estadiaId: 1,
        nombreServicio: "Agua Mineral San Mateo 1L",
        cantidad: 2,
        precioUnitario: 5.00,
        subtotal: 10.00,
        fechaConsumo: new Date(Date.now() - 3 * 3600000).toISOString()
      }
    ],
    pagos: [
      {
        id: 1,
        estadiaId: 1,
        monto: 150.00,
        metodoPago: "YAPE",
        fechaPago: new Date(Date.now() - 86400000).toISOString(),
        nroOperacion: "YAPE-948210",
        tipoComprobante: "BOLETA",
        notas: "Pago inicial al momento del Check-In"
      }
    ]
  }
];

export const INITIAL_USUARIOS = [
  {
    id: 1,
    username: "pluna",
    nombreCompleto: "Pablo Luna",
    email: "pluna@hotelprincesica.com",
    telefono: "956123456",
    rol: "RECEPCIONISTA",
    turno: "Tarde",
    activo: true
  },
  {
    id: 2,
    username: "mgomez",
    nombreCompleto: "María Gómez",
    email: "mgomez@hotelprincesica.com",
    telefono: "956789123",
    rol: "RECEPCIONISTA",
    turno: "Mañana",
    activo: true
  },
  {
    id: 3,
    username: "rflores",
    nombreCompleto: "Rosa Flores",
    email: "rflores@hotelprincesica.com",
    telefono: "956321654",
    rol: "LIMPIEZA",
    turno: "Mañana",
    activo: true
  },
  {
    id: 4,
    username: "admin",
    nombreCompleto: "Administrador Principal",
    email: "admin@hotelprincesica.com",
    telefono: "999888777",
    rol: "ADMINISTRADOR",
    turno: "General",
    activo: true
  }
];

export const INITIAL_LIMPIEZA = [
  {
    id: 1,
    habitacion: INITIAL_HABITACIONES[2],
    empleadoAsignado: INITIAL_USUARIOS[2],
    tipoLimpieza: "CHECKOUT",
    estado: "PENDIENTE",
    prioridad: "ALTA",
    observaciones: "Check-out realizado a las 11:00 AM. Requiere cambio de sábanas y desinfección completa.",
    fechaCreacion: new Date(Date.now() - 2 * 3600000).toISOString(),
    fechaInicio: null,
    fechaFin: null
  }
];
