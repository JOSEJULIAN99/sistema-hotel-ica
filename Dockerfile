# --- Etapa de construccion (segun Seccion 4 de la Guia con Java 21) ---
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# --- Etapa de ejecucion ---
FROM eclipse-temurin:21-jre
WORKDIR /app
RUN useradd --system --uid 1001 hotel && mkdir -p /app/uploads && chown hotel /app/uploads
COPY --from=build /app/target/*.jar app.jar
USER hotel
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
