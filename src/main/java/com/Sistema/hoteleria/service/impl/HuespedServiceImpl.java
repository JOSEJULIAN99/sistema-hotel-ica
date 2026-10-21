package com.Sistema.hoteleria.service.impl;

import com.Sistema.hoteleria.dto.HuespedDTO;
import com.Sistema.hoteleria.exception.BadRequestException;
import com.Sistema.hoteleria.exception.ResourceNotFoundException;
import com.Sistema.hoteleria.model.entity.Huesped;
import com.Sistema.hoteleria.repository.EstadiaRepository;
import com.Sistema.hoteleria.repository.HuespedRepository;
import com.Sistema.hoteleria.repository.ReservacionRepository;
import com.Sistema.hoteleria.service.HuespedService;
import com.Sistema.hoteleria.util.EntityMapper;
import com.Sistema.hoteleria.util.ValidadorDatos;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HuespedServiceImpl implements HuespedService {

    private final HuespedRepository huespedRepository;
    private final ReservacionRepository reservacionRepository;
    private final EstadiaRepository estadiaRepository;

    @Override
    @Transactional(readOnly = true)
    public List<HuespedDTO> obtenerTodos() {
        return huespedRepository.findAll().stream()
                .map(EntityMapper::toHuespedDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public HuespedDTO obtenerPorId(Long id) {
        Huesped h = huespedRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Huésped", "id", id));
        return EntityMapper.toHuespedDTO(h);
    }

    @Override
    @Transactional(readOnly = true)
    public HuespedDTO obtenerPorDocumento(String numeroDocumento) {
        Huesped h = huespedRepository.findByNumeroDocumento(numeroDocumento)
                .orElseThrow(() -> new ResourceNotFoundException("Huésped", "número de documento", numeroDocumento));
        return EntityMapper.toHuespedDTO(h);
    }

    @Override
    @Transactional(readOnly = true)
    public List<HuespedDTO> buscar(String filtro) {
        if (filtro == null || filtro.trim().isEmpty()) {
            return obtenerTodos();
        }
        return huespedRepository.buscarPorNombreODocumento(filtro.trim()).stream()
                .map(EntityMapper::toHuespedDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public HuespedDTO crear(HuespedDTO dto) {
        validar(dto);
        dto.setNumeroDocumento(dto.getNumeroDocumento().trim().toUpperCase());
        if (huespedRepository.existsByNumeroDocumento(dto.getNumeroDocumento())) {
            throw new BadRequestException("Ya existe un huésped con el documento: " + dto.getNumeroDocumento());
        }
        Huesped h = Huesped.builder()
                .nombres(dto.getNombres())
                .apellidos(dto.getApellidos())
                .tipoDocumento(dto.getTipoDocumento())
                .numeroDocumento(dto.getNumeroDocumento())
                .telefono(dto.getTelefono())
                .email(dto.getEmail())
                .nacionalidad(dto.getNacionalidad() != null ? dto.getNacionalidad() : "Peruana")
                .ciudadProcedencia(dto.getCiudadProcedencia())
                .build();
        return EntityMapper.toHuespedDTO(huespedRepository.save(h));
    }

    @Override
    @Transactional
    public HuespedDTO actualizar(Long id, HuespedDTO dto) {
        Huesped h = huespedRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Huésped", "id", id));
        validar(dto);
        dto.setNumeroDocumento(dto.getNumeroDocumento().trim().toUpperCase());

        if (!h.getNumeroDocumento().equalsIgnoreCase(dto.getNumeroDocumento()) &&
                huespedRepository.existsByNumeroDocumento(dto.getNumeroDocumento())) {
            throw new BadRequestException("Ya existe otro huésped con el documento: " + dto.getNumeroDocumento());
        }

        h.setNombres(dto.getNombres());
        h.setApellidos(dto.getApellidos());
        h.setTipoDocumento(dto.getTipoDocumento());
        h.setNumeroDocumento(dto.getNumeroDocumento());
        h.setTelefono(dto.getTelefono());
        h.setEmail(dto.getEmail());
        h.setNacionalidad(dto.getNacionalidad());
        h.setCiudadProcedencia(dto.getCiudadProcedencia());

        return EntityMapper.toHuespedDTO(huespedRepository.save(h));
    }

    @Override
    @Transactional
    public void eliminar(Long id) {
        if (!huespedRepository.existsById(id)) {
            throw new ResourceNotFoundException("Huésped", "id", id);
        }
        if (reservacionRepository.existsByHuespedId(id) || estadiaRepository.existsByHuespedId(id)) {
            throw new BadRequestException("El huésped tiene reservas o estadías registradas; no se puede eliminar para conservar el historial");
        }
        huespedRepository.deleteById(id);
    }

    /** Mismas reglas que la web: nombre, documento según su tipo, celular y correo. */
    private static void validar(HuespedDTO dto) {
        ValidadorDatos.errores()
                .agregar("nombres", ValidadorDatos.nombre(dto.getNombres(), "nombres"))
                .agregar("apellidos", ValidadorDatos.nombre(dto.getApellidos(), "apellidos"))
                .agregar("numeroDocumento", ValidadorDatos.documento(dto.getTipoDocumento(), dto.getNumeroDocumento()))
                .agregar("telefono", ValidadorDatos.telefono(dto.getTelefono()))
                .agregar("email", ValidadorDatos.email(dto.getEmail()))
                .lanzarSiHay();
    }
}
