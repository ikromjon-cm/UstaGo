# UstaGo

## Quick Start (Development)

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Mobile
```bash
cd mobile
flutter pub get
flutter run
```

## Docker
```bash
docker compose up --build
```

## Documentation
- `docs/enterprise-production-spec.md` — enterprise product and technical specification
- `docs/database-schema.sql` — PostgreSQL schema baseline

## Tests
```bash
# Backend
cd backend && python manage.py test

# Frontend
cd frontend && npm run lint && npm run build

# Mobile
cd mobile && flutter test && flutter analyze
```
