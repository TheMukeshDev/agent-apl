# SportSphere AI - Backend Dockerfile (Subdirectory Context)
FROM python:3.12-slim

WORKDIR /app

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend files
COPY . .

# Default port
ENV PORT=8080
EXPOSE 8080

# Start app
CMD ["sh", "-c", "uvicorn app:app --host 0.0.0.0 --port $PORT"]
