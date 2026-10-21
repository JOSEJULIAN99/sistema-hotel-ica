package com.Sistema.hoteleria.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class ChatRequestDTO {

    @NotEmpty(message = "Escriba un mensaje")
    @Size(max = 12, message = "La conversación es muy larga; inicie una nueva")
    @Valid
    private List<MensajeChatDTO> mensajes;

    @Getter
    @Setter
    @NoArgsConstructor
    public static class MensajeChatDTO {
        /** "usuario" o "asistente" */
        @NotBlank
        private String rol;

        @NotBlank(message = "El mensaje está vacío")
        @Size(max = 800, message = "El mensaje admite hasta 800 caracteres")
        private String contenido;
    }
}
