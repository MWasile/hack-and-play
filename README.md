# Hack & Play

Hackathon project built during Hack&Play (https://hackandplay.pl). The app aggregates anonymized telecom data and related urban datasets into simple indicators to help assess a neighborhood when choosing a new place to live.

Live demo: https://idk-hackplay.pl

## Stack
- Frontend: React + TypeScript + Vite
- Backend: FastAPI (Python) + SQLAlchemy + Alembic
- Database: PostgreSQL 16
- Containers & local dev: Docker Compose
- Infra: Helm charts (Kubernetes) and Terraform (AKS/ingress)
- Notebooks: Jupyter for indicators and ML experiments

## Quick start (Local Docker Compose)
Prerequisites: Docker and Docker Compose installed.

1. From the repository root, build and start services:
   - macOS/Linux:
     - `docker compose up --build`
   - Windows (PowerShell):
     - `docker compose up --build`

2. Open the apps:
   - Frontend: http://localhost:5173
   - API (FastAPI): http://localhost:5001
   - API docs (Swagger): http://localhost:5001/docs
   - PostgreSQL: localhost:5433 (mapped to container 5432)

Services are defined via the root docker-compose.yaml which includes:
- backend/docker-compose.yaml (API + Postgres)
- frontend/docker-compose.yaml (web app)

## Development
## Project layout
- `backend/` — API, models, DB, migrations
- `frontend/` — React web app
- `infra/` — Helm charts and Terraform modules
- `notebooks/` — data processing and indicators notebooks

## Indicators
- City Traffic Index
  - Data source: anonymized network connection logs from mobile cells (Hackathon dataset).
  - Description: measures the overall movement intensity across Warsaw’s districts based on user mobility during morning, noon, and evening hours.
- Social Life Index
  - Data source: anonymized cell presence data (Hackathon dataset).
  - Description: estimates how actively people gather in shared spaces by analyzing the density of simultaneous user presence.
- District Rhythm Index
  - Data source: timestamped user connection data (Hackathon dataset).
  - Description: captures the daily heartbeat of each district by analyzing how activity varies throughout the day.
- Green Life Index
  - Data source: network activity data joined with green-area polygons from OpenStreetMap (via OSMnx).
  - Description: reflects how strongly each district is connected to parks, forests, and recreational green spaces.
- Digital Noise Index
  - Data source: mobile network usage data (Hackathon dataset).
  - Description: quantifies digital activity intensity by combining the number of connected devices with network event volume, weighted by technology type.
- Life Balance Index
  - Data source: derived from presence and digital activity indicators.
  - Description: measures how balanced each district is between physical presence and digital engagement — highlighting calmer, more “offline” zones.
- Social Availability Index
  - Data source: timestamped user presence data (Hackathon dataset).
  - Description: shows how long and evenly each district remains socially active during the day, capturing time diversity of urban life.
- Safety Index
  - Data source: publicly available incident data from the Polish national Geoportal (Mapa Zagrożeń Bezpieczeństwa).
  - Description: measures spatial safety by comparing relative numbers of reported incidents across Warsaw’s districts.

## Troubleshooting
- Port already in use:
  - Frontend uses 5173, API uses 5001, Postgres maps to 5433. Stop conflicting services or change ports in the respective docker-compose files.
- Database persistence:
  - Postgres uses a named Docker volume (`db_volume`). Remove it if you want a clean slate.

## Contributing
Issues and pull requests are welcome. Keep changes small and focused.

## License
TBD