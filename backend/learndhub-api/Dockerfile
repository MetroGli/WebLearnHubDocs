# ===== Etapa 1: compilación =====
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /build

# Cachear dependencias primero (mejora tiempos de rebuild)
COPY pom.xml .
RUN mvn -B dependency:go-offline

COPY src ./src
RUN mvn -B clean package -DskipTests

# ===== Etapa 2: imagen final =====
FROM eclipse-temurin:17-jre-ubi9-minimal
WORKDIR /app

# Usuario sin privilegios
RUN addgroup -S learndhub && adduser -S learndhub -G learndhub
COPY --from=build /build/target/learndhub-api-*.jar app.jar
RUN mkdir -p /app/storage && chown -R learndhub:learndhub /app
USER learndhub

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
