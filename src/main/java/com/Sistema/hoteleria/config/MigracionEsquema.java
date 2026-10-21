package com.Sistema.hoteleria.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;
import java.sql.Statement;

/**
 * Ajustes de esquema que DDL_AUTO=update no hace por sí solo.
 * Cuando Hibernate creó la tabla usuarios (por ejemplo en Supabase), dejó un CHECK con los roles
 * de ese momento; sin quitarlo no se podría guardar el nuevo rol CLIENTE.
 */
@Component
@Order(10)
@RequiredArgsConstructor
@Slf4j
public class MigracionEsquema implements CommandLineRunner {

    private final DataSource dataSource;

    @Override
    public void run(String... args) {
        try (Connection conexion = dataSource.getConnection(); Statement sentencia = conexion.createStatement()) {
            if (!"PostgreSQL".equalsIgnoreCase(conexion.getMetaData().getDatabaseProductName())) {
                return;
            }
            sentencia.execute("ALTER TABLE usuarios DROP CONSTRAINT IF EXISTS usuarios_rol_check");
        } catch (SQLException e) {
            log.warn("No se pudo ajustar el esquema de usuarios: {}", e.getMessage());
        }
    }
}
