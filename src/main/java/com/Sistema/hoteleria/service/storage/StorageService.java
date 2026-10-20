package com.Sistema.hoteleria.service.storage;

/** Almacenamiento de archivos (fotos de habitaciones). Implementaciones: Supabase Storage o disco local. */
public interface StorageService {

    /** Guarda el archivo y devuelve su URL pública. */
    String guardar(String ruta, byte[] contenido, String contentType);

    /** Elimina el archivo si la URL pertenece a este almacenamiento; si no, no hace nada. */
    void eliminar(String urlPublica);

    /** "supabase" o "local". */
    String tipo();

    /** true si la configuración necesaria está completa. */
    boolean configurado();
}
