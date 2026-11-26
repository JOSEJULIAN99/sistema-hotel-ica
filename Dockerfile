# ---------- Etapa 1: compilar el backend ----------
FROM eclipse-temurin:21-jdk AS build
WORKDIR /app
COPY .mvn .mvn
COPY mvnw pom.xml ./
RUN chmod +x mvnw && ./mvnw -B -q dependency:go-offline
COPY src src
RUN ./mvnw -B -q package -DskipTests

# ---------- Etapa 2: imagen de ejecución ----------
FROM eclipse-temurin:21-jre
WORKDIR /app
RUN useradd --system --uid 1001 hotel && mkdir -p /app/uploads && chown hotel /app/uploads
COPY --from=build /app/target/*.jar app.jar
USER hotel
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
