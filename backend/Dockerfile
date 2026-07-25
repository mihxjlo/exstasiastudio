FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn clean package -DskipTests -B

# Corretto rather than eclipse-temurin:17-jre-alpine: Temurin publishes musl/Alpine
# builds for x64 only, which would break the arm64 image Oracle Cloud needs.
FROM amazoncorretto:17-alpine AS runtime
WORKDIR /app
RUN addgroup -S spring && adduser -S spring -G spring
RUN mkdir -p /uploads && chown spring:spring /uploads
COPY --from=build /app/target/*.jar app.jar
RUN chown spring:spring app.jar
VOLUME ["/uploads"]
USER spring
EXPOSE 8080
# Size the heap from the container memory limit rather than the JVM's 25% default.
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]
