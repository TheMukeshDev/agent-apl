# SportSphere AI - Cloud Run Backend Dockerfile (Root Context)
FROM python:3.12-slim

WORKDIR /app

# Copy backend requirements and install dependencies
COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir -r ./backend/requirements.txt

# Copy backend source code
COPY backend/ ./backend/

# Default port (Google Cloud Run overrides this with its own PORT env var)
ENV PORT=8080
EXPOSE 8080

# Run uvicorn server pointing to backend.app
CMD ["sh", "-c", "uvicorn backend.app:app --host 0.0.0.0 --port $PORT"]
