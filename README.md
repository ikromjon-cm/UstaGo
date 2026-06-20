# UstaGo - Uzbekistan's Largest Service Marketplace

UstaGo is a complete production-ready on-demand service marketplace platform connecting customers with skilled workers throughout Uzbekistan.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Python 3.12, Django 5.1, DRF 3.15 |
| **Frontend** | Next.js 15, TypeScript, Tailwind CSS 4 |
| **Mobile** | Flutter 3.24 (Android + iOS) |
| **Database** | PostgreSQL 16 + PostGIS + Redis 7 |
| **Queue** | Celery + Redis |
| **WebSocket** | Django Channels + Daphne |
| **Admin** | Django Admin + Custom Dashboard |
| **Monitoring** | Prometheus + Grafana + Sentry |
| **Deployment** | Docker + Nginx + GitHub Actions |

## Architecture

```
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│  Flutter App │  │  Next.js    │  │  Admin Panel│
│  (Android/iOS)│  │  (Web)      │  │  (Web)      │
└──────┬───────┘  └──────┬──────┘  └──────┬──────┘
       │                 │                 │
       └─────────────────┼─────────────────┘
                         │
                 ┌───────▼───────┐
                 │    Nginx      │
                 │  (Reverse     │
                 │   Proxy)      │
                 └───┬───┬───────┘
                     │   │
            ┌────────▼┐ ┌▼────────┐
            │ Daphne  │ │ Gunicorn│
            │(WebSocket)│ │ (REST)  │
            └────┬────┘ └────┬────┘
                 │           │
            ┌────▼───────────▼────┐
            │   Django App        │
            │   (Channels + DRF)  │
            └──┬────────┬─────────┘
               │        │
        ┌──────▼─┐  ┌──▼──────┐
        │PostgreSQL│  │  Redis  │
        │ + PostGIS│  │ Cache   │
        └─────────┘  │ + Queue │
                      └─────────┘
```

## Project Structure

```
├── backend/           # Django Backend
│   ├── config/        # Settings, URLs, WSGI/ASGI
│   ├── apps/
│   │   ├── users/     # Auth, Profiles, Wallets
│   │   ├── categories/# Services & Categories
│   │   ├── orders/    # Orders, Offers, Tracking
│   │   ├── payments/  # Payments, Payouts
│   │   ├── reviews/   # Ratings & Reviews
│   │   ├── chat/      # Real-time messaging
│   │   ├── notifications/ # Push & In-app
│   │   ├── analytics/ # Metrics & Reports
│   │   └── ai/        # AI Assistant, Fraud Detection
│   ├── manage.py
│   └── requirements.txt
├── frontend/          # Next.js Web App
│   ├── src/
│   │   ├── app/       # Pages & Routing
│   │   ├── components/# UI Components
│   │   ├── lib/       # API client, utilities
│   │   ├── store/     # State management
│   │   └── hooks/     # Custom hooks
│   └── package.json
├── mobile/            # Flutter Apps
│   ├── lib/
│   │   ├── src/
│   │   │   ├── screens/   # All screens
│   │   │   ├── widgets/   # Reusable widgets
│   │   │   ├── providers/ # State management
│   │   │   ├── services/  # API services
│   │   │   └── models/    # Data models
│   │   └── main.dart
│   └── pubspec.yaml
├── docker/            # Docker configs
│   ├── Dockerfile.backend
│   ├── Dockerfile.frontend
│   ├── Dockerfile.celery
│   ├── nginx.conf
│   └── prometheus.yml
├── scripts/           # DevOps scripts
│   ├── deploy.sh
│   └── backup.sh
├── docs/              # Documentation
│   └── database-schema.sql
├── .github/           # CI/CD
│   └── workflows/
│       └── ci-cd.yml
├── docker-compose.yml
└── README.md
```

## Quick Start

### Prerequisites

- Python 3.12+, Node.js 20+, Flutter 3.24+
- PostgreSQL 16, Redis 7
- Docker & Docker Compose (optional)

### Local Development

```bash
# 1. Clone and setup backend
git clone <repo> && cd ustago
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env

# 2. Setup database
createdb ustago
python manage.py migrate
python manage.py loaddata fixtures/initial.json

# 3. Start backend
python manage.py runserver

# 4. Start frontend (new terminal)
cd frontend
npm install
npm run dev

# 5. Start mobile (new terminal)
cd mobile
flutter pub get
flutter run
```

### Docker Deployment

```bash
# Full stack with Docker
cp .env.example .env
docker compose up -d
```

## API Documentation

- **Swagger UI**: `http://localhost:8000/api/v1/docs/`
- **ReDoc**: `http://localhost:8000/api/v1/redoc/`
- **Schema**: `http://localhost:8000/api/v1/schema/`

### Core Endpoints

| Endpoint | Description |
|----------|-------------|
| `POST /api/v1/auth/register/` | Register new user |
| `POST /api/v1/auth/login/` | Login |
| `POST /api/v1/auth/send_otp/` | Send OTP |
| `POST /api/v1/auth/verify_otp/` | Verify OTP |
| `GET /api/v1/categories/` | List categories |
| `GET /api/v1/categories/tree/` | Category tree |
| `GET /api/v1/masters/nearby/` | Nearby masters |
| `POST /api/v1/orders/` | Create order |
| `GET /api/v1/orders/` | List orders |
| `POST /api/v1/orders/{id}/make_offer/` | Make offer |
| `GET /api/v1/chat/rooms/` | Chat rooms |
| `POST /api/v1/payments/` | Payments |
| `POST /api/v1/ai/analyze/` | AI analysis |
| `POST /api/v1/ai/chat/` | AI chat |
| `GET /api/v1/analytics/dashboard/` | Analytics |

## Key Features

### Customer Flow
1. Register → Select service → Describe problem → AI analysis
2. Receive offers from nearby masters → Choose master
3. Track in real-time → Chat/Call → Pay after completion
4. Rate & Review

### Master Flow
1. Register → Verify identity → Set services & pricing
2. Receive order notifications → Submit price offers
3. Accept orders → Start work → Complete → Get paid

### Admin Flow
1. Full user & order management
2. Payment monitoring & dispute resolution
3. Analytics dashboards
4. Content moderation
5. AI monitoring

## Security

- JWT + Refresh Tokens
- OTP Verification
- Rate Limiting (per user/IP)
- CSRF, XSS, SQL Injection protection
- Device tracking
- 2FA support
- Audit logging
- OWASP Top 10 compliance

## Performance Targets

| Metric | Target |
|--------|--------|
| Page Load | < 2 seconds |
| API Response | < 500ms |
| Order Creation | < 30 seconds |
| Uptime | 99.9% |
| Concurrent Users | 100,000+ |
| Registered Users | 1,000,000+ |

## Monitoring

- **Prometheus**: Metrics collection
- **Grafana**: Dashboards (port 3001)
- **Sentry**: Error tracking
- **Health Check**: `/api/v1/health/`

## Backup

- Daily: 7 day retention
- Weekly: 4 week retention
- Monthly: 6 month retention
- Manual: Admin panel trigger

## License

Proprietary. All rights reserved.
