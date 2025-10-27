# Country Currency & Exchange API

A RESTful API built with NestJS that fetches country data from external APIs, stores it in a MySQL database, and provides CRUD operations with filtering and sorting capabilities.

## Features

- Fetch country data and exchange rates from external APIs
- Cache data in MySQL database
- Filter countries by region and currency
- Sort countries by GDP, population, or name
- Generate summary images with top countries by GDP
- Comprehensive error handling

## Tech Stack

- **Framework:** NestJS
- **Database:** MySQL with TypeORM
- **External APIs:**
  - Countries API: https://restcountries.com/v2/all
  - Exchange Rates API: https://open.er-api.com/v6/latest/USD
- **Image Generation:** Jimp

## Prerequisites

- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd hng-task-2
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
   - Copy `.env` file and update with your MySQL credentials:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_DATABASE=countries_api
PORT=3000
```

4. Create the MySQL database:
```sql
CREATE DATABASE countries_api;
```

5. Start the application:
```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

The API will be available at `http://localhost:3000`

## API Endpoints

### 1. POST /countries/refresh
Fetch all countries and exchange rates, then cache them in the database.

**Response:**
```json
{
  "message": "Countries refreshed successfully",
  "count": 250
}
```

### 2. GET /countries
Get all countries from the database with optional filters and sorting.

**Query Parameters:**
- `region` - Filter by region (e.g., `?region=Africa`)
- `currency` - Filter by currency code (e.g., `?currency=NGN`)
- `sort` - Sort results (options: `gdp_asc`, `gdp_desc`, `population_asc`, `population_desc`, `name_asc`, `name_desc`)

**Example:**
```bash
GET /countries?region=Africa&sort=gdp_desc
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "Nigeria",
    "capital": "Abuja",
    "region": "Africa",
    "population": 206139589,
    "currency_code": "NGN",
    "exchange_rate": 1600.23,
    "estimated_gdp": 25767448125.2,
    "flag_url": "https://flagcdn.com/ng.svg",
    "last_refreshed_at": "2025-10-22T18:00:00Z"
  }
]
```

### 3. GET /countries/:name
Get a single country by name.

**Example:**
```bash
GET /countries/Nigeria
```

**Response:**
```json
{
  "id": 1,
  "name": "Nigeria",
  "capital": "Abuja",
  "region": "Africa",
  "population": 206139589,
  "currency_code": "NGN",
  "exchange_rate": 1600.23,
  "estimated_gdp": 25767448125.2,
  "flag_url": "https://flagcdn.com/ng.svg",
  "last_refreshed_at": "2025-10-22T18:00:00Z"
}
```

### 4. DELETE /countries/:name
Delete a country record.

**Response:**
```json
{
  "message": "Country deleted successfully"
}
```

### 5. GET /status
Show total countries and last refresh timestamp.

**Response:**
```json
{
  "total_countries": 250,
  "last_refreshed_at": "2025-10-22T18:00:00Z"
}
```

### 6. GET /countries/image
Serve the generated summary image showing top 5 countries by GDP.

**Response:** PNG image file

**Error Response (if image not generated yet):**
```json
{
  "error": "Summary image not found"
}
```

## Error Handling

The API returns consistent JSON error responses:

- **404 Not Found:**
```json
{
  "error": "Country not found"
}
```

- **400 Bad Request:**
```json
{
  "error": "Validation failed",
  "details": {
    "currency_code": "is required"
  }
}
```

- **503 Service Unavailable:**
```json
{
  "error": "External data source unavailable",
  "details": "Could not fetch data from Countries API"
}
```

- **500 Internal Server Error:**
```json
{
  "error": "Internal server error"
}
```

## How It Works

### Currency & GDP Calculation

1. **Currency Handling:**
   - If a country has multiple currencies, only the first one is stored
   - If no currencies exist, `currency_code`, `exchange_rate` are set to `null`, and `estimated_gdp` to `0`
   - If currency code not found in exchange rates, `exchange_rate` and `estimated_gdp` are set to `null`

2. **GDP Calculation:**
   ```
   estimated_gdp = population × random(1000-2000) ÷ exchange_rate
   ```
   - A new random multiplier (1000-2000) is generated on each refresh

3. **Update vs Insert:**
   - Countries are matched by name (case-insensitive)
   - Existing countries are updated with fresh data
   - New countries are inserted

### Image Generation

When `/countries/refresh` runs successfully:
1. Query top 5 countries by estimated GDP
2. Generate a PNG image with Jimp containing:
   - Total number of countries
   - Top 5 countries with their GDP values
   - Last refresh timestamp
3. Save to `cache/summary.png`

## Database Schema

**Table:** `countries`

| Field | Type | Description |
|-------|------|-------------|
| id | INT (Auto) | Primary key |
| name | VARCHAR (Unique) | Country name |
| capital | VARCHAR (Nullable) | Capital city |
| region | VARCHAR (Nullable) | Region |
| population | BIGINT | Population count |
| currency_code | VARCHAR (Nullable) | Currency code (e.g., NGN) |
| exchange_rate | DECIMAL(10,2) (Nullable) | Exchange rate vs USD |
| estimated_gdp | DECIMAL(20,2) (Nullable) | Calculated GDP |
| flag_url | VARCHAR (Nullable) | Flag image URL |
| last_refreshed_at | TIMESTAMP | Last update time |

## Project Structure

```
src/
├── countries/
│   ├── entities/
│   │   └── country.entity.ts
│   ├── dto/
│   │   └── query-countries.dto.ts
│   ├── services/
│   │   ├── external-api.service.ts
│   │   └── image-generation.service.ts
│   ├── countries.controller.ts
│   ├── countries.service.ts
│   └── countries.module.ts
├── common/
│   └── filters/
│       └── http-exception.filter.ts
├── app.module.ts
└── main.ts
```

## Testing

First, ensure your MySQL database is running and configured properly.

1. **Start the API:**
```bash
npm run start:dev
```

2. **Refresh country data:**
```bash
curl -X POST http://localhost:3000/countries/refresh
```

3. **Get all countries:**
```bash
curl http://localhost:3000/countries
```

4. **Filter by region:**
```bash
curl http://localhost:3000/countries?region=Africa
```

5. **Get status:**
```bash
curl http://localhost:3000/countries/status
```

6. **View summary image:**
Open `http://localhost:3000/countries/image` in your browser

## License

MIT
