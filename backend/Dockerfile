# Iris API image: built with the Maven wrapper, run on a slim Java 21 runtime as a non-root user.
FROM eclipse-temurin:21-jdk AS build
WORKDIR /src
COPY .mvn .mvn
COPY mvnw pom.xml ./
RUN ./mvnw -q -B dependency:go-offline
COPY src src
RUN ./mvnw -q -B -DskipTests package \
 && find target -maxdepth 1 -name '*.jar' ! -name '*plain*' -exec cp {} app.jar \;

FROM eclipse-temurin:21-jre-alpine
RUN addgroup -S iris && adduser -S iris -G iris
WORKDIR /app
COPY --from=build /src/app.jar app.jar
USER iris
EXPOSE 8080
ENV PORT=8080 JAVA_OPTS="-XX:MaxRAMPercentage=70"
ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar app.jar"]
