package com.learndhub.api.controller;

import com.learndhub.api.dto.DocumentoDTO;
import com.learndhub.api.model.Documento;
import com.learndhub.api.model.Fase;
import com.learndhub.api.model.TipoArchivo;
import com.learndhub.api.service.DocumentoService;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/documentos")
public class DocumentoController {

    private final DocumentoService servicio;

    public DocumentoController(DocumentoService servicio) {
        this.servicio = servicio;
    }

    @GetMapping
    public List<DocumentoDTO> listar(@RequestParam(value = "fase", required = false) Fase fase,
                                      @RequestParam(value = "tipo", defaultValue = "DOCUMENTO") TipoArchivo tipo) {
        return servicio.listar(fase, tipo);
    }

    @GetMapping("/resumen")
    public Map<String, Long> resumen(@RequestParam(value = "tipo", defaultValue = "DOCUMENTO") TipoArchivo tipo) {
        return servicio.resumenPorFase(tipo);
    }

    @PostMapping
    public ResponseEntity<DocumentoDTO> subir(@RequestParam(value = "fase", required = false) Fase fase,
                                               @RequestParam(value = "tipo", defaultValue = "DOCUMENTO") TipoArchivo tipo,
                                               @RequestParam("archivo") MultipartFile archivo,
                                               @RequestParam(value = "nombreDocumento", required = false) String nombreDocumento,
                                               @RequestParam(value = "autor", required = false) String autor,
                                               @RequestParam(value = "version", required = false) String version,
                                               @RequestParam(value = "observaciones", required = false) String observaciones) {
        DocumentoDTO creado = servicio.subir(fase, tipo, archivo, nombreDocumento, autor, version, observaciones);
        return ResponseEntity.status(201).body(creado);
    }

    @GetMapping("/{id}/descargar")
    public ResponseEntity<Resource> descargar(@PathVariable Long id) {
        Documento doc = servicio.obtenerOFallar(id);
        Resource recurso = servicio.descargar(id);
        String nombreCodificado = java.net.URLEncoder.encode(doc.getNombreOriginal(), StandardCharsets.UTF_8);
        return ResponseEntity.ok()
                .contentType(org.springframework.http.MediaType.parseMediaType(doc.getTipoContenido()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename*=UTF-8''" + nombreCodificado)
                .body(recurso);
    }

    @GetMapping("/{id}/vista-previa")
    public ResponseEntity<Resource> vistaPrevia(@PathVariable Long id) {
        Documento doc = servicio.obtenerOFallar(id);
        Resource recurso = servicio.descargar(id);
        String nombreCodificado = java.net.URLEncoder.encode(doc.getNombreOriginal(), StandardCharsets.UTF_8);
        return ResponseEntity.ok()
                .contentType(org.springframework.http.MediaType.parseMediaType(doc.getTipoContenido()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename*=UTF-8''" + nombreCodificado)
                .body(recurso);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        servicio.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
