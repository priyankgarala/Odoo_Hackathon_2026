# TransitOps API Reference

Base URL: `http://localhost:5000/api`

## Auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register user |
| POST | `/auth/login` | Login (sets JWT cookie) |
| POST | `/auth/logout` | Logout |
| GET | `/auth/me` | Current user |

## Vehicles

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/vehicles` | List vehicles (filters: type, status, region) |
| GET | `/vehicles/available` | Available vehicles for dispatch |
| GET | `/vehicles/:id` | Get vehicle |
| POST | `/vehicles` | Create vehicle (Fleet Manager) |
| PUT | `/vehicles/:id` | Update vehicle (Fleet Manager) |
| DELETE | `/vehicles/:id` | Delete vehicle (Fleet Manager) |

## Drivers

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/drivers` | List drivers |
| GET | `/drivers/available` | Available drivers for dispatch |
| GET | `/drivers/:id` | Get driver |
| POST | `/drivers` | Create driver |
| PUT | `/drivers/:id` | Update driver |
| DELETE | `/drivers/:id` | Delete driver |

## Trips

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/trips` | List trips |
| GET | `/trips/:id` | Get trip |
| POST | `/trips` | Create trip (draft) |
| PATCH | `/trips/:id/dispatch` | Dispatch trip |
| PATCH | `/trips/:id/complete` | Complete trip |
| PATCH | `/trips/:id/cancel` | Cancel trip |

## Maintenance

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/maintenance` | List maintenance logs |
| POST | `/maintenance` | Create log (sets vehicle In Shop) |
| PATCH | `/maintenance/:id/close` | Close log (restores vehicle) |

## Fuel & Expenses

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/fuel-logs` | List fuel logs |
| POST | `/fuel-logs` | Create fuel log |
| GET | `/expenses` | List expenses |
| POST | `/expenses` | Create expense |
| GET | `/expenses/vehicle/:vehicleId/cost` | Operational cost per vehicle |

## Dashboard & Reports

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dashboard/kpis` | Dashboard KPIs |
| GET | `/reports/analytics` | Fuel efficiency, ROI, costs |
| GET | `/reports/export/csv` | CSV export |
