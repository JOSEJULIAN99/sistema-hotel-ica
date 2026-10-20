package com.Sistema.hoteleria.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;

/** Habilita tareas programadas (análisis diario de tarifas). */
@Configuration
@EnableScheduling
public class SchedulingConfig {
}
