#!/bin/bash
set -e

echo "=========================================="
echo "  UstaGo Deployment Script"
echo "=========================================="

export COMPOSE_PROJECT_NAME=ustago

if [ ! -f .env ]; then
    echo "Error: .env file not found!"
    echo "Copy .env.example to .env and configure it"
    exit 1
fi

source .env

echo "[1/6] Pulling latest images..."
docker compose pull

echo "[2/6] Starting database and cache..."
docker compose up -d postgres redis
sleep 5

echo "[3/6] Running database migrations..."
docker compose run --rm backend python manage.py migrate --noinput

echo "[4/6] Collecting static files..."
docker compose run --rm backend python manage.py collectstatic --noinput --clear

echo "[5/6] Starting all services..."
docker compose up -d

echo "[6/6] Health check..."
sleep 5
curl -sf http://localhost:8000/api/v1/health/ && echo " - Backend healthy" || echo " - Backend check failed"
curl -sf http://localhost:3000/ && echo " - Frontend healthy" || echo " - Frontend check failed"

echo ""
echo "=========================================="
echo "  UstaGo deployed successfully!"
echo "  Backend:  http://localhost:8000"
echo "  Frontend: http://localhost:3000"
echo "  Admin:    http://localhost:8000/admin/"
echo "  API Docs: http://localhost:8000/api/v1/docs/"
echo "  Grafana:  http://localhost:3001"
echo "=========================================="
