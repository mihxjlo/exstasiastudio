FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn clean package -DskipTests -B

FROM eclipse-temurin:17-jre-alpine AS runtime
WORKDIR /app
RUN addgroup -S spring && adduser -S spring -G spring
RUN mkdir -p /uploads && chown spring:spring /uploads
COPY --from=build /app/target/*.jar app.jar
RUN chown spring:spring app.jar
VOLUME ["/uploads"]
USER spring
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
