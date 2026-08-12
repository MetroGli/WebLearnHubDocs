package com.learndhub.api.exception;

public class AlmacenamientoException extends RuntimeException {
    public AlmacenamientoException(String mensaje, Throwable causa) {
        super(mensaje, causa);
    }
    public AlmacenamientoException(String mensaje) {
        super(mensaje);
    }
}
