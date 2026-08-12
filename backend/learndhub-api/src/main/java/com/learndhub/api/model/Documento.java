package com.learndhub.api.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "documentos")
public class Documento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column
    private Fase fase;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoArchivo tipo;

    @Column(nullable = false)
    private String nombreOriginal;

    @Column(nullable = false, unique = true)
    private String nombreAlmacenado;

    @Column
    private String nombreDocumento;

    @Column
    private String autor;

    @Column
    private String version;

    @Column(length = 1000)
    private String observaciones;

    @Column(nullable = false)
    private long tamano;

    @Column(nullable = false)
    private String tipoContenido;

    @Column(nullable = false)
    private LocalDateTime fechaSubida;

    public Documento() {}

    public Documento(Fase fase, TipoArchivo tipo, String nombreOriginal, String nombreAlmacenado,
                      long tamano, String tipoContenido, String nombreDocumento,
                      String autor, String version, String observaciones) {
        this.fase = fase;
        this.tipo = tipo;
        this.nombreOriginal = nombreOriginal;
        this.nombreAlmacenado = nombreAlmacenado;
        this.tamano = tamano;
        this.tipoContenido = tipoContenido;
        this.nombreDocumento = nombreDocumento;
        this.autor = autor;
        this.version = version;
        this.observaciones = observaciones;
        this.fechaSubida = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public Fase getFase() { return fase; }
    public TipoArchivo getTipo() { return tipo; }
    public String getNombreOriginal() { return nombreOriginal; }
    public String getNombreAlmacenado() { return nombreAlmacenado; }
    public String getNombreDocumento() { return nombreDocumento; }
    public String getAutor() { return autor; }
    public String getVersion() { return version; }
    public String getObservaciones() { return observaciones; }
    public long getTamano() { return tamano; }
    public String getTipoContenido() { return tipoContenido; }
    public LocalDateTime getFechaSubida() { return fechaSubida; }

    public void setFase(Fase fase) { this.fase = fase; }
}
