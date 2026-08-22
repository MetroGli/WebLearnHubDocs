package com.learndhub.api.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    // Con Caddy como proxy inverso, frontend y API quedan bajo el mismo
    // dominio, así que esto casi no entra en juego. Se deja configurable
    // por si en algún momento se sirve el frontend desde otro origen.
    @Value("${learndhub.cors.allowed-origin:*}")
    private String allowedOrigin;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOriginPatterns(allowedOrigin)
                .allowedMethods("GET", "POST", "DELETE", "PUT", "OPTIONS")
                .allowedHeaders("*");
    }
}
