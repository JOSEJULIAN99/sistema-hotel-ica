package com.Sistema.hoteleria.config;

import com.Sistema.hoteleria.service.monitoreo.ActividadInterceptor;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/** Registra el interceptor que guarda la actividad del API. */
@Configuration
@RequiredArgsConstructor
public class MonitoreoConfig implements WebMvcConfigurer {

    private final ActividadInterceptor actividadInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(actividadInterceptor).addPathPatterns("/api/**");
    }
}
