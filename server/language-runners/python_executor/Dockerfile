FROM python:3.11-slim
WORKDIR /app
COPY . /app
CMD ["sh", "-c", "ulimit -s 16384 && python main.py"]
