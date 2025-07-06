FROM openjdk:17
WORKDIR /app
COPY . /app
CMD ["bash", "-c", "javac $JAVA_FILE && java ${JAVA_FILE%.java}"]
