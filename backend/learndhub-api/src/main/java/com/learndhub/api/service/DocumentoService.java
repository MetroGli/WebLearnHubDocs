package com.learndhub.api.service;

import com.learndhub.api.dto.DocumentoDTO;
import com.learndhub.api.exception.RecursoNoEncontradoException;
import com.learndhub.api.model.Documento;
import com.learndhub.api.model.Fase;
import com.learndhub.api.model.TipoArchivo;
import com.learndhub.api.repository.DocumentoRepository;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class DocumentoService {

    private final DocumentoRepository repositorio;
    private final FileStorageService almacenamiento;

    public DocumentoService(DocumentoRepository repositorio, FileStorageService almacenamiento) {
        this.repositorio = repositorio;
        this.almacenamiento = almacenamiento;
    }

    public List<DocumentoDTO> listar(Fase fase, TipoArchivo tipo) {
        List<Documento> resultado = fase != null
                ? repositorio.findByFaseAndTipoOrderByFechaSubidaDesc(fase, tipo)
                : repositorio.findByTipoOrderByFechaSubidaDesc(tipo);
        return resultado.stream().map(DocumentoDTO::desde).toList();
    }

    public Map<String, Long> resumenPorFase(TipoArchivo tipo) {
        Map<String, Long> resumen = new LinkedHashMap<>();
        for (Fase fase : Fase.values()) {
            resumen.put(fase.name(), repositorio.countByFaseAndTipo(fase, tipo));
        }
        return resumen;
    }

    public DocumentoDTO subir(Fase fase, TipoArchivo tipo, MultipartFile archivo, String nombreDocumento,
                               String autor, String version, String observaciones) {
        if (archivo == null || archivo.isEmpty()) {
            throw new IllegalArgumentException("El archivo está vacío o no fue enviado");
        }
        if (tipo == TipoArchivo.DOCUMENTO && fase == null) {
            throw new IllegalArgumentException("La fase es obligatoria para subir un documento");
        }
        String nombreAlmacenado = almacenamiento.guardar(archivo);
        Documento doc = new Documento(
                fase,
                tipo,
                archivo.getOriginalFilename(),
                nombreAlmacenado,
                archivo.getSize(),
                archivo.getContentType() != null ? archivo.getContentType() : "application/octet-stream",
                vacioComoNulo(nombreDocumento),
                vacioComoNulo(autor),
                vacioComoNulo(version),
                vacioComoNulo(observaciones)
        );
        return DocumentoDTO.desde(repositorio.save(doc));
    }

    private String vacioComoNulo(String valor) {
        return (valor == null || valor.isBlank()) ? null : valor.trim();
    }

    public Resource descargar(Long id) {
        Documento doc = obtenerOFallar(id);
        return almacenamiento.cargarComoRecurso(doc.getNombreAlmacenado());
    }

    public Documento obtenerOFallar(Long id) {
        return repositorio.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("No existe un documento con id " + id));
    }

    public void eliminar(Long id) {
        Documento doc = obtenerOFallar(id);
        almacenamiento.eliminar(doc.getNombreAlmacenado());
        repositorio.delete(doc);
    }
}
