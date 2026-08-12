package com.learndhub.api.repository;

import com.learndhub.api.model.Documento;
import com.learndhub.api.model.Fase;
import com.learndhub.api.model.TipoArchivo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DocumentoRepository extends JpaRepository<Documento, Long> {
    List<Documento> findByFaseAndTipoOrderByFechaSubidaDesc(Fase fase, TipoArchivo tipo);
    List<Documento> findByTipoOrderByFechaSubidaDesc(TipoArchivo tipo);
    long countByFaseAndTipo(Fase fase, TipoArchivo tipo);
}
