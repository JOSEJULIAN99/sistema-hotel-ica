package com.Sistema.hoteleria.service.storage;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;

/** Guarda en una carpeta del servidor y sirve los archivos en /uploads/**. Útil sin Supabase. */
public class LocalStorageService implements StorageService {

    private final Path carpeta;
    private final String urlBackend;

    public LocalStorageService(String carpeta, String urlBackend) {
        this.carpeta = Path.of(carpeta).toAbsolutePath().normalize();
        this.urlBackend = urlBackend.endsWith("/") ? urlBackend.substring(0, urlBackend.length() - 1) : urlBackend;
    }

    private String prefijoPublico() {
        return urlBackend + "/uploads/";
    }

    @Override
    public String guardar(String ruta, byte[] contenido, String contentType) {
        Path destino = carpeta.resolve(ruta).normalize();
        if (!destino.startsWith(carpeta)) {
            throw new IllegalArgumentException("Ruta de archivo no válida");
        }
        try {
            Files.createDirectories(destino.getParent());
            Files.write(destino, contenido);
        } catch (IOException e) {
            throw new UncheckedIOException("No se pudo guardar el archivo", e);
        }
        return prefijoPublico() + ruta;
    }

    @Override
    public void eliminar(String urlPublica) {
        if (urlPublica == null || !urlPublica.startsWith(prefijoPublico())) {
            return;
        }
        Path archivo = carpeta.resolve(urlPublica.substring(prefijoPublico().length())).normalize();
        if (archivo.startsWith(carpeta)) {
            try {
                Files.deleteIfExists(archivo);
            } catch (IOException ignored) {
                // si no se puede borrar, queda huérfano; no afecta la operación
            }
        }
    }

    @Override
    public String tipo() {
        return "local";
    }

    @Override
    public boolean configurado() {
        return true;
    }

    public Path getCarpeta() {
        return carpeta;
    }
}
