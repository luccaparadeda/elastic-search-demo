'use client';

import { useCallback, useEffect, useState } from 'react';
import { useDebounce } from '@/lib/hooks/use-debounce';
import { SearchResponse } from '@/lib/types/search';
import { ProductWithHighlight } from '@/lib/types/product';
import { SearchBar } from '@/components/search/search-bar';
import { ProductCard } from '@/components/search/product-card';
import { FiltersSidebar } from '@/components/search/filters-sidebar';
import { SearchStats } from '@/components/search/search-stats';
import { Pagination } from '@/components/search/pagination';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, Database } from 'lucide-react';

export default function Home() {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<any>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSeeded, setHasSeeded] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const debouncedQuery = useDebounce(query, 300);

  const performSearch = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/elasticsearch/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: debouncedQuery,
          filters,
          page: currentPage,
          pageSize: 12,
        }),
      });

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data: SearchResponse = await response.json();
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [debouncedQuery, filters, currentPage]);

  const seedDatabase = async () => {
    setSeeding(true);
    try {
      const response = await fetch('/api/seed', { method: 'POST' });
      if (!response.ok) throw new Error('Seeding failed');
      setHasSeeded(true);
      setTimeout(() => performSearch(), 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Seeding failed');
    } finally {
      setSeeding(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedQuery, filters]);

  useEffect(() => {
    if (hasSeeded || debouncedQuery || Object.keys(filters).length > 0) {
      performSearch();
    }
  }, [debouncedQuery, filters, currentPage, hasSeeded, performSearch]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!hasSeeded && !results) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="max-w-md space-y-4 text-center">
          <Database className="mx-auto h-16 w-16 text-zinc-400" />
          <h1 className="text-2xl font-bold">Elasticsearch Product Search Demo</h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Initialize the database with sample product data to get started
          </p>
          <Button onClick={seedDatabase} disabled={seeding} size="lg">
            {seeding ? 'Seeding Database...' : 'Seed Database'}
          </Button>
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">Product Search</h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Search through our catalog of products
          </p>
        </div>

        <div className="mb-6">
          <SearchBar query={query} onQueryChange={setQuery} />
        </div>

        <div className="flex gap-6">
          <aside className="hidden w-64 lg:block">
            <FiltersSidebar
              aggregations={results?.aggregations}
              filters={filters}
              onFiltersChange={setFilters}
            />
          </aside>

          <main className="flex-1">
            {results && <SearchStats total={results.total} took={results.took} />}

            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {loading ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-96 w-full" />
                ))}
              </div>
            ) : results && results.hits.length > 0 ? (
              <>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {results.hits.map((product: ProductWithHighlight) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
                <Pagination
                  currentPage={currentPage}
                  totalResults={results.total}
                  pageSize={12}
                  onPageChange={handlePageChange}
                />
              </>
            ) : (
              <div className="py-12 text-center">
                <p className="text-lg text-zinc-600 dark:text-zinc-400">
                  No products found. Try adjusting your search or filters.
                </p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
