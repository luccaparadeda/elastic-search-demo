'use client';

interface SearchStatsProps {
  total: number;
  took: number;
}

export function SearchStats({ total, took }: SearchStatsProps) {
  return (
    <div className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
      Found <span className="font-semibold text-zinc-900 dark:text-zinc-100">{total}</span>{' '}
      {total === 1 ? 'product' : 'products'} in {took}ms
    </div>
  );
}
