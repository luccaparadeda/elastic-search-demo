# Elasticsearch Product Search Demo

A full-featured e-commerce product search application built with Next.js 16, Elasticsearch, and shadcn/ui.

## Features

- **Full-Text Search**: Multi-field search across product names, descriptions, brands, and tags with fuzzy matching
- **Real-Time Autocomplete**: Instant search suggestions as you type (300ms debounce)
- **Advanced Filters**:
  - Category filtering with counts
  - Brand filtering with counts
  - Price range slider
  - In-stock only toggle
- **Search Highlighting**: Search terms are highlighted in product names and descriptions
- **Aggregations**: Dynamic filter counts based on current search results
- **Responsive Design**: Mobile-friendly UI built with shadcn/ui components
- **Sample Data**: 150 realistic products across 5 categories

## Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript
- **Search Engine**: Elasticsearch 8.11
- **UI Components**: shadcn/ui (New York style)
- **Styling**: Tailwind CSS v4
- **State Management**: React hooks with debouncing
- **Data Generation**: Faker.js for realistic product data

## Prerequisites

- Node.js 18+ and pnpm
- Docker and Docker Compose (for Elasticsearch)

## Quick Start

### 1. Clone and Install

```bash
cd elastic-search-demo
pnpm install
```

### 2. Start Elasticsearch

```bash
docker-compose up -d
```

Wait 30-60 seconds for Elasticsearch to be ready. Verify it's running:

```bash
curl http://localhost:9200
```

You should see JSON response with Elasticsearch cluster info.

### 3. Start the Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Seed the Database

Click the "Seed Database" button on the welcome screen to populate Elasticsearch with 150 sample products.

## Environment Variables

The `.env.local` file contains:

```env
# Elasticsearch Configuration
ELASTICSEARCH_NODE=http://localhost:9200
ELASTICSEARCH_INDEX_NAME=products

# App Configuration
NEXT_PUBLIC_ITEMS_PER_PAGE=12
NEXT_PUBLIC_MAX_AUTOCOMPLETE_RESULTS=5
```

For cloud deployment (Elastic Cloud), add:

```env
ELASTICSEARCH_CLOUD_ID=your-cloud-id
ELASTICSEARCH_API_KEY=your-api-key
```

## Project Structure

```
elastic-search-demo/
├── app/
│   ├── api/
│   │   ├── elasticsearch/
│   │   │   ├── health/route.ts       # Health check
│   │   │   ├── search/route.ts       # Main search
│   │   │   ├── suggest/route.ts      # Autocomplete
│   │   │   └── filters/route.ts      # Available filters
│   │   └── seed/route.ts             # Seed database
│   ├── page.tsx                      # Main UI
│   └── layout.tsx                    # Root layout
├── components/
│   ├── ui/                           # shadcn/ui components
│   └── search/
│       ├── search-bar.tsx            # Search input
│       ├── product-card.tsx          # Product display
│       ├── filters-sidebar.tsx       # Filters panel
│       └── search-stats.tsx          # Results stats
├── lib/
│   ├── elasticsearch/
│   │   ├── client.ts                 # ES client
│   │   ├── config.ts                 # Configuration
│   │   ├── index-mapping.ts          # Index schema
│   │   ├── queries.ts                # Query builders
│   │   └── seed-data.ts              # Sample data
│   ├── hooks/
│   │   └── use-debounce.ts           # Debounce hook
│   └── types/
│       ├── product.ts                # Product types
│       ├── search.ts                 # Search types
│       └── filters.ts                # Filter types
└── docker-compose.yml                # ES + Kibana
```

## API Endpoints

### POST /api/seed
Initialize/reset the database with sample products.

**Response:**
```json
{
  "success": true,
  "message": "Successfully seeded 150 products",
  "count": 150
}
```

### POST /api/elasticsearch/search
Search for products with filters.

**Request:**
```json
{
  "query": "laptop",
  "filters": {
    "categories": ["Electronics"],
    "brands": ["TechPro"],
    "priceRange": { "min": 100, "max": 1500 },
    "inStock": true
  },
  "page": 1,
  "pageSize": 12
}
```

**Response:**
```json
{
  "hits": [...],
  "total": 42,
  "took": 15,
  "aggregations": {
    "categories": [...],
    "brands": [...],
    "priceRange": { "min": 19.99, "max": 1999.99 },
    "avgRating": 4.2
  }
}
```

### GET /api/elasticsearch/suggest?q=laptop
Get autocomplete suggestions.

**Response:**
```json
{
  "suggestions": ["TechPro Pro Laptop", "Ultra Notebook"],
  "products": [...]
}
```

### GET /api/elasticsearch/filters
Get available filter options.

### GET /api/elasticsearch/health
Check Elasticsearch connection status.

## Elasticsearch Features

### Index Mapping
- **Edge N-gram analyzer** for autocomplete (2-20 characters)
- **Multi-field mappings** for both text search and exact matching
- **Keyword fields** for efficient faceting
- **Non-indexed fields** for display-only data

### Query Features
- **Multi-match query** with field boosting (name^3, brand^2)
- **Fuzzy matching** for typo tolerance
- **Boolean filters** for categories, price range, etc.
- **Aggregations** for dynamic facet counts
- **Highlighting** with custom tags

## Development

### Access Kibana
Kibana is available at [http://localhost:5601](http://localhost:5601) for debugging and exploring data.

### Restart Elasticsearch
```bash
docker-compose restart elasticsearch
```

### View Elasticsearch Logs
```bash
docker-compose logs -f elasticsearch
```

### Stop Services
```bash
docker-compose down
```

### Remove Data Volume
```bash
docker-compose down -v
```

## Building for Production

```bash
pnpm build
pnpm start
```

## Troubleshooting

### Elasticsearch won't start
- Increase Docker memory to at least 4GB
- Check logs: `docker-compose logs elasticsearch`

### "Connection refused" error
- Ensure Elasticsearch is running: `docker ps`
- Wait 60 seconds after starting Elasticsearch
- Check health: `curl http://localhost:9200/_cluster/health`

### Search returns no results
- Re-seed the database
- Check index exists: `curl http://localhost:9200/products`

## Performance Tips

- Debouncing (300ms) reduces API calls
- Pagination limits results to 12 items
- Aggregations cached for current search
- Images lazy-loaded with next/image

## Future Enhancements

- [ ] Pagination controls
- [ ] Sort options (price, rating, newest)
- [ ] Product detail pages
- [ ] Shopping cart
- [ ] User authentication
- [ ] Save searches/favorites
- [ ] Advanced filters (color, size)
- [ ] Related products
- [ ] Search analytics

## License

MIT
