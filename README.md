# LearndHub — Repositorio de documentación del proyecto

Aplicación web para que el equipo **LearndHub** (Ingeniería de Software)
suba y organice los archivos de documentación de cada una de las 8 fases
del proyecto: **Lanzamiento, Estrategia, Planificación, Requerimientos,
Diseño, Implementación, Pruebas y Mantenimiento**.

La plataforma tiene tres secciones, accesibles desde el menú principal
del panel lateral:
- **Documentos**: entregables organizados por fase (la línea de tiempo
  de las 8 fases solo aparece dentro de esta sección).
- **Plantillas**: repositorio general de formatos base, no depende de
  una fase — cada plantilla puede etiquetarse opcionalmente con la
  fase a la que aplica, o quedar como "General".
- **Equipo**: biografía y rol de cada integrante, independiente de las
  fases del proyecto.

## Arquitectura del proyecto

```
learndhub/
├── frontend/                  # HTML + CSS + JS puro (sin frameworks)
│   ├── index.html
│   ├── css/
│   │   ├── reset.css          # reset mínimo
│   │   ├── variables.css      # paleta y tipografía (design tokens del logo)
│   │   ├── layout.css         # estructura: sidebar + panel principal
│   │   └── components.css     # dropzone, tarjetas, badges, toasts
│   ├── js/
│   │   ├── phases.js          # datos de las 7 fases
│   │   ├── api.js             # cliente REST hacia el backend
│   │   └── main.js            # lógica de interfaz
│   └── assets/
│       └── logo.png
│
└── backend/
    └── learndhub-api/         # API REST en Java + Spring Boot
        ├── pom.xml
        └── src/main/java/com/learndhub/api/
            ├── LearndhubApiApplication.java
            ├── controller/DocumentoController.java
            ├── service/{DocumentoService, FileStorageService}.java
            ├── repository/DocumentoRepository.java
            ├── model/{Documento, Fase}.java
            ├── dto/{DocumentoDTO, ErrorDTO}.java
            ├── config/WebConfig.java          # CORS
            └── exception/...                  # manejo global de errores
```

## Cómo ejecutar el backend

Requisitos: **Java 17+** y **Maven** (o usa `./mvnw` si lo agregas con
`mvn -N io.takari:maven:wrapper`).

```bash
cd backend/learndhub-api
mvn spring-boot:run
```

El servidor queda disponible en `http://localhost:8080`. Al iniciar por
primera vez crea automáticamente:
- una base de datos H2 embebida en `./data/learndhub.mv.db` (metadatos de los archivos)
- una carpeta `./storage/` donde se guardan físicamente los archivos subidos

Consola H2 (opcional, para depurar): `http://localhost:8080/h2-console`
(JDBC URL: `jdbc:h2:file:./data/learndhub`, usuario `sa`, sin contraseña).

## Cómo ejecutar el frontend

Es HTML/CSS/JS estático, no necesita build. Basta con abrir
`frontend/index.html` con una extensión tipo *Live Server*, o servirlo
con cualquier servidor estático:

```bash
cd frontend
python3 -m http.server 5500
# abrir http://localhost:5500
```

> El backend debe estar corriendo en `localhost:8080` (configurable en
> `frontend/js/api.js`, constante `BASE_URL`). Si el backend no responde,
> la interfaz muestra un aviso en la parte superior.

## Endpoints de la API

| Método | Ruta                              | Descripción                              |
|--------|------------------------------------|-------------------------------------------|
| GET    | `/api/documentos?fase=DISENO&tipo=DOCUMENTO` | Lista los documentos o plantillas de una fase (`tipo` es `DOCUMENTO` o `PLANTILLA`, por defecto `DOCUMENTO`) |
| GET    | `/api/documentos/resumen?tipo=DOCUMENTO` | Cantidad de archivos por cada fase |
| POST   | `/api/documentos` | Sube un archivo (`multipart/form-data`: `fase`, `tipo`, `archivo`, `nombreDocumento`, `autor`, `version`, `observaciones`) |
| GET    | `/api/documentos/{id}/descargar` | Descarga un archivo |
| DELETE | `/api/documentos/{id}` | Elimina un archivo |

Valores válidos de `fase`: `LANZAMIENTO`, `ESTRATEGIA`, `PLANIFICACION`,
`REQUERIMIENTOS`, `DISENO`, `IMPLEMENTACION`, `PRUEBAS`, `MANTENIMIENTO`.

## Diseño

La paleta y el elemento de línea de tiempo del panel lateral se tomaron
directamente del isotipo de LearndHub (birrete + libro en azules sobre
fondo blanco): el mismo degradado navy → azul del logo se usa en el
sidebar y en la barra de progreso, y los nodos numerados conectados por
una línea reinterpretan tanto el círculo del logo como el gráfico de
fases del PDF original.

Tipografías: **Space Grotesk** (títulos), **Inter** (texto), **JetBrains
Mono** (nombres de archivo y metadatos), cargadas desde Google Fonts.

## Equipo

Santiago Ramírez Gómez · Juan Pablo Camacho Peñata · Sebastián Camilo
Sandoval Rodríguez · Alexandra Tinjacá Cortés · Duván Sebastián Monroy
Bolaños
