package com.Sistema.hoteleria.config;

import com.Sistema.hoteleria.service.storage.LocalStorageService;
import com.Sistema.hoteleria.service.storage.StorageService;
import com.Sistema.hoteleria.service.storage.SupabaseStorageService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;

/** Elige Supabase Storage si sus claves están en .env; si no, guarda en disco local. */
@Slf4j
@Configuration
public class StorageConfig implements WebMvcConfigurer {

    @Value("${app.uploads.dir:uploads}")
    private String carpetaLocal;

    @Bean
    public StorageService storageService(RestClient.Builder builder,
                                         @Value("${app.storage.tipo:local}") String tipo,
                                         @Value("${app.supabase.url:}") String supabaseUrl,
                                         @Value("${app.supabase.service-role-key:}") String supabaseKey,
                                         @Value("${app.supabase.bucket:habitaciones}") String bucket,
                                         @Value("${app.backend-url:http://localhost:8080}") String backendUrl) {
        if ("supabase".equalsIgnoreCase(tipo) && !supabaseUrl.isBlank() && !supabaseKey.isBlank()) {
            log.info("Fotos en Supabase Storage, bucket '{}'", bucket);
            return new SupabaseStorageService(builder, supabaseUrl, bucket, supabaseKey);
        }
        if ("supabase".equalsIgnoreCase(tipo)) {
            log.warn("STORAGE_TIPO=supabase pero faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY; se usa disco local");
        }
        return new LocalStorageService(carpetaLocal, backendUrl);
    }

    /** Sirve los archivos locales en /uploads/** (solo lectura). */
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String ubicacion = Path.of(carpetaLocal).toAbsolutePath().normalize().toUri().toString();
        registry.addResourceHandler("/uploads/**").addResourceLocations(ubicacion);
    }
}
