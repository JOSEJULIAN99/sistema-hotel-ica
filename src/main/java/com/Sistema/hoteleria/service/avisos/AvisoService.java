package com.Sistema.hoteleria.service.avisos;

import com.Sistema.hoteleria.model.entity.Aviso;
import com.Sistema.hoteleria.model.enums.RolUsuario;
import com.Sistema.hoteleria.model.enums.TipoAviso;
import com.Sistema.hoteleria.repository.AvisoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/** Avisos instantáneos (RF-06): se guardan y se envían en el momento a los conectados. */
@Slf4j
@Service
@RequiredArgsConstructor
public class AvisoService {

    private final AvisoRepository avisoRepository;
    private final CanalAvisos canal;

    @Transactional
    public Aviso enviar(TipoAviso tipo, String mensaje, String habitacionNumero, RolUsuario rolDestino, String usuario) {
        Aviso aviso = avisoRepository.save(Aviso.builder()
                .tipo(tipo)
                .mensaje(mensaje.length() > 300 ? mensaje.substring(0, 300) : mensaje)
                .habitacionNumero(habitacionNumero)
                .rolDestino(rolDestino)
                .creadoPor(usuario)
                .build());
        try {
            canal.enviar(aviso, rolDestino);
        } catch (Exception e) {
            // el aviso queda guardado; quien no estaba conectado lo verá al abrir el panel
            log.warn("No se pudo difundir el aviso {}: {}", aviso.getId(), e.getMessage());
        }
        return aviso;
    }

    /** Últimos avisos visibles para un rol. */
    @Transactional(readOnly = true)
    public List<Aviso> recientes(RolUsuario rol) {
        boolean veTodo = rol == RolUsuario.ADMINISTRADOR || rol == RolUsuario.GERENTE;
        return avisoRepository.findTop50ByOrderByFechaDesc().stream()
                .filter(a -> veTodo || a.getRolDestino() == null || a.getRolDestino() == rol)
                .limit(30)
                .toList();
    }
}
