# Seller Insights Viewer

A web application for viewing and analyzing AI-generated seller listing insights stored in BigQuery. This tool provides visibility into the prompts, responses, and token usage for the seller listing insights feature.

## Purpose

This application allows teams to:

- Browse historical AI interactions for seller listing insights
- View rendered prompts and model outputs
- Filter by environment, listing ID, or customer ID
- Monitor token usage and costs across requests
- Debug and analyze AI behavior for specific listings

## Features

- **Paginated browsing** of seller listing insight records
- **Filtering** by environment, listing ID, and customer ID
- **Detailed view** of individual insights including full prompt and response payloads
- **Statistics dashboard** showing aggregate metrics (total records, unique listings/customers, token usage)
- **Environment selector** for filtering between staging/production data

## Tech Stack

- **Backend:** Node.js with Express and TypeScript
- **Database:** Google BigQuery
- **Frontend:** Static HTML served from `/public`

## Setup

### Prerequisites

- Node.js 18+
- A Google Cloud service account with BigQuery read access
- Access to the `ai_history.seller_listing_insights` table

### Installation

```bash
npm install
```

### Configuration

Place your Google Cloud service account JSON file at `service-account.json` in the project root.

### Running

**Development:**
```bash
npm run dev
```

**Production:**
```bash
npm run build
npm start
```

The server runs on `http://localhost:3000` by default (configurable via `PORT` environment variable).

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/insights` | List insights with pagination and filtering |
| `GET /api/insights/:id` | Get a single insight by ID |
| `GET /api/environments` | Get list of unique environments |
| `GET /api/stats` | Get aggregate statistics |

### Query Parameters for `/api/insights`

- `limit` - Number of records to return (default: 100)
- `offset` - Pagination offset (default: 0)
- `environment` - Filter by environment
- `listingId` - Filter by listing ID
- `customerId` - Filter by customer ID
