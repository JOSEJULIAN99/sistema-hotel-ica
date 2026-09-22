package com.Sistema.hoteleria.controller;

import com.Sistema.hoteleria.dto.ApiResponse;
import com.Sistema.hoteleria.dto.HuespedDTO;
import com.Sistema.hoteleria.service.HuespedService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/huespedes")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class HuespedController {

    private final HuespedService huespedService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<HuespedDTO>>> listar(
            @RequestParam(required = false) String search) {
        List<HuespedDTO> resultado = (search != null && !search.trim().isEmpty())
                ? huespedService.buscar(search)
                : huespedService.obtenerTodos();
        return ResponseEntity.ok(ApiResponse.ok("Listado de huéspedes", resultado));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<HuespedDTO>> obtenerPorId(@PathVariable Long id) {
        HuespedDTO huesped = huespedService.obtenerPorId(id);
        return ResponseEntity.ok(ApiResponse.ok(huesped));
    }

    @GetMapping("/documento/{documento}")
    public ResponseEntity<ApiResponse<HuespedDTO>> obtenerPorDocumento(@PathVariable String documento) {
        HuespedDTO huesped = huespedService.obtenerPorDocumento(documento);
        return ResponseEntity.ok(ApiResponse.ok(huesped));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<HuespedDTO>> crear(@Valid @RequestBody HuespedDTO dto) {
        HuespedDTO nuevo = huespedService.crear(dto);
        return new ResponseEntity<>(ApiResponse.ok("Huésped registrado exitosamente", nuevo), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<HuespedDTO>> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody HuespedDTO dto) {
        HuespedDTO actualizado = huespedService.actualizar(id, dto);
        return ResponseEntity.ok(ApiResponse.ok("Huésped actualizado exitosamente", actualizado));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> eliminar(@PathVariable Long id) {
        huespedService.eliminar(id);
        return ResponseEntity.ok(ApiResponse.ok("Huésped eliminado exitosamente", null));
    }
}
