# TransitOps

Smart Transport Operations Platform — Odoo Hackathon 2026

A centralized platform for managing vehicles, drivers, dispatch, maintenance, fuel/expenses, and operational analytics.

## Project Structure

```
├── frontend/     # React 19 + Vite + TypeScript + Tailwind + shadcn/ui
├── backend/      # Node.js + Express + Prisma + PostgreSQL
├── docs/         # Architecture and API documentation
└── README.md
```

## Tech Stack

**Frontend:** React 19, Vite, TypeScript, React Router, Tailwind CSS, shadcn/ui, TanStack Query, TanStack Table, React Hook Form, Zod, Recharts

**Backend:** Node.js, Express, PostgreSQL, Prisma, JWT, bcrypt, Express Validator

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL (local instance)

### 1. Database

Create a PostgreSQL database named `transitops`, then configure the connection:

```bash
cd backend
cp .env.example .env
# Edit .env with your DATABASE_URL
```

### 2. Backend

```bash
cd backend
npm install
npm run db:generate
npm run db:migrate
npm run dev
```

API runs at `http://localhost:5000`

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs at `http://localhost:5173`

## First User

Register via API before logging into the UI:

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@transitops.com","password":"password123","name":"Fleet Admin","role":"FLEET_MANAGER"}'
```

## Roles

- **Fleet Manager** — vehicles, maintenance, trips, dashboard
- **Driver** — trip management
- **Safety Officer** — driver compliance
- **Financial Analyst** — fuel, expenses, reports

## Documentation

- [Architecture](docs/architecture.md)
- [API Reference](docs/api.md)
