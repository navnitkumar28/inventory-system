# ── Backend Dockerfile ──────────────────────────────────────────────────────
# Multi-stage-style: slim base keeps the final image small.
# ─────────────────────────────────────────────────────────────────────────────

FROM python:3.12-slim

# Keeps Python from buffering stdout/stderr (important for Docker logs)
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Install deps first so Docker can cache this layer
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source
COPY . .

EXPOSE 8000

# Run with uvicorn; reload is handy in dev – remove for production
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
