package com.Sistema.hoteleria.service.storage;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.web.client.RestClient;

/**
 * Supabase Storage por su API REST. El bucket debe existir y ser público para que la web muestre las fotos.
 * La clave service_role solo vive en el backend (.env); nunca se envía al navegador.
 */
@Slf4j
public class SupabaseStorageService implements StorageService {

    private final RestClient restClient;
    private final String urlBase;
    private final String bucket;
    private final String clave;

    public SupabaseStorageService(RestClient.Builder builder, String urlBase, String bucket, String clave) {
        this.restClient = builder.build();
        this.urlBase = urlBase.endsWith("/") ? urlBase.substring(0, urlBase.length() - 1) : urlBase;
        this.bucket = bucket;
        this.clave = clave;
    }

    private String prefijoPublico() {
        return urlBase + "/storage/v1/object/public/" + bucket + "/";
    }

    @Override
    public String guardar(String ruta, byte[] contenido, String contentType) {
        restClient.post()
                .uri(urlBase + "/storage/v1/object/" + bucket + "/" + ruta)
                .header("Authorization", "Bearer " + clave)
                .header("apikey", clave)
                .header("x-upsert", "true")
                .contentType(MediaType.parseMediaType(contentType))
                .body(contenido)
                .retrieve()
                .toBodilessEntity();
        return prefijoPublico() + ruta;
    }

    @Override
    public void eliminar(String urlPublica) {
        if (urlPublica == null || !urlPublica.startsWith(prefijoPublico())) {
            return;
        }
        String ruta = urlPublica.substring(prefijoPublico().length());
        try {
            restClient.delete()
                    .uri(urlBase + "/storage/v1/object/" + bucket + "/" + ruta)
                    .header("Authorization", "Bearer " + clave)
                    .header("apikey", clave)
                    .retrieve()
                    .toBodilessEntity();
        } catch (Exception e) {
            log.warn("No se pudo eliminar {} de Supabase Storage: {}", ruta, e.getMessage());
        }
    }

    @Override
    public String tipo() {
        return "supabase";
    }

    @Override
    public boolean configurado() {
        return !urlBase.isBlank() && !clave.isBlank() && !bucket.isBlank();
    }
}
