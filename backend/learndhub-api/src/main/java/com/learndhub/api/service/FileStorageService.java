package com.learndhub.api.service;

import com.learndhub.api.exception.AlmacenamientoException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileStorageService {

    private final Path directorioRaiz;

    public FileStorageService(@Value("${learndhub.storage.directorio}") String directorio) {
        this.directorioRaiz = Paths.get(directorio).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.directorioRaiz);
        } catch (IOException e) {
            throw new AlmacenamientoException("No fue posible crear el directorio de almacenamiento", e);
        }
    }

    public String guardar(MultipartFile archivo) {
        String original = archivo.getOriginalFilename() != null ? archivo.getOriginalFilename() : "archivo";
        String extension = "";
        int i = original.lastIndexOf('.');
        if (i >= 0) extension = original.substring(i);

        String nombreUnico = UUID.randomUUID() + extension;
        try {
            Path destino = this.directorioRaiz.resolve(nombreUnico).normalize();
            Files.copy(archivo.getInputStream(), destino, StandardCopyOption.REPLACE_EXISTING);
            return nombreUnico;
        } catch (IOException e) {
            throw new AlmacenamientoException("No fue posible guardar el archivo '" + original + "'", e);
        }
    }

    public Resource cargarComoRecurso(String nombreAlmacenado) {
        try {
            Path archivo = this.directorioRaiz.resolve(nombreAlmacenado).normalize();
            Resource recurso = new UrlResource(archivo.toUri());
            if (recurso.exists() && recurso.isReadable()) {
                return recurso;
            }
            throw new AlmacenamientoException("El archivo '" + nombreAlmacenado + "' no se encuentra en disco");
        } catch (MalformedURLException e) {
            throw new AlmacenamientoException("Ruta de archivo inválida: " + nombreAlmacenado, e);
        }
    }

    public void eliminar(String nombreAlmacenado) {
        try {
            Path archivo = this.directorioRaiz.resolve(nombreAlmacenado).normalize();
            Files.deleteIfExists(archivo);
        } catch (IOException e) {
            throw new AlmacenamientoException("No fue posible eliminar el archivo '" + nombreAlmacenado + "'", e);
        }
    }
}
