package com.learndhub.api.dto;

import com.learndhub.api.model.Documento;
import java.time.LocalDateTime;

public record DocumentoDTO(
        Long id,
        String fase,
        String tipo,
        String nombreOriginal,
        String nombreDocumento,
        String autor,
        String version,
        String observaciones,
        long tamano,
        String tipoContenido,
        LocalDateTime fechaSubida
) {
    public static DocumentoDTO desde(Documento d) {
        return new DocumentoDTO(
                d.getId(),
                d.getFase() != null ? d.getFase().name() : null,
                d.getTipo().name(),
                d.getNombreOriginal(),
                d.getNombreDocumento(),
                d.getAutor(),
                d.getVersion(),
                d.getObservaciones(),
                d.getTamano(),
                d.getTipoContenido(),
                d.getFechaSubida()
        );
    }
}
