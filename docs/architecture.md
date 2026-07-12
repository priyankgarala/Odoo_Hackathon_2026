# TransitOps — Architecture

## Overview

TransitOps is a full-stack transport operations platform built as a monorepo:

- **frontend/** — React 19 + Vite + TypeScript
- **backend/** — Node.js + Express + Prisma + PostgreSQL

## Data Flow

```
Browser → React (TanStack Query) → Express API → Prisma → PostgreSQL
```

Authentication uses JWT stored in HTTP-only cookies. All `/api/*` routes (except auth login/register) require authentication.

## Core Modules

| Module | Backend Service | Frontend Page |
|--------|----------------|---------------|
| Auth & RBAC | `auth.service.ts` | `LoginPage` |
| Vehicles | `vehicle.service.ts` | `VehiclesPage` |
| Drivers | `driver.service.ts` | `DriversPage` |
| Trips | `trip.service.ts` | `TripsPage` |
| Maintenance | `maintenance.service.ts` | `MaintenancePage` |
| Fuel & Expenses | `fuel.service.ts`, `expense.service.ts` | `FuelExpensesPage` |
| Dashboard | `dashboard.service.ts` | `DashboardPage` |
| Reports | `report.service.ts` | `ReportsPage` |

## Business Rules (enforced in services)

- Unique vehicle registration numbers
- Only `AVAILABLE` vehicles/drivers appear in dispatch pool
- Expired/suspended drivers cannot be assigned
- Cargo weight ≤ vehicle max capacity
- Dispatch → vehicle + driver become `ON_TRIP`
- Complete/Cancel dispatched trip → restore `AVAILABLE`
- Create maintenance → vehicle becomes `IN_SHOP`
- Close maintenance → vehicle becomes `AVAILABLE`

## Roles

| Role | Permissions |
|------|-------------|
| `FLEET_MANAGER` | Vehicles, maintenance, trips, dashboard, reports |
| `DRIVER` | Trips |
| `SAFETY_OFFICER` | Drivers |
| `FINANCIAL_ANALYST` | Fuel, expenses, reports |
