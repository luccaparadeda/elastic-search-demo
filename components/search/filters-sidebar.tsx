'use client';

import { SearchAggregations } from '@/lib/types/search';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useState } from 'react';

interface FiltersSidebarProps {
  aggregations?: SearchAggregations;
  filters: any;
  onFiltersChange: (filters: any) => void;
}

export function FiltersSidebar({ aggregations, filters, onFiltersChange }: FiltersSidebarProps) {
  const [priceRange, setPriceRange] = useState<number[]>([
    filters.priceRange?.min || 0,
    filters.priceRange?.max || 2000,
  ]);

  if (!aggregations) return null;

  const handleCategoryToggle = (category: string) => {
    const current = filters.categories || [];
    const updated = current.includes(category)
      ? current.filter((c: string) => c !== category)
      : [...current, category];
    onFiltersChange({ ...filters, categories: updated.length > 0 ? updated : undefined });
  };

  const handleBrandToggle = (brand: string) => {
    const current = filters.brands || [];
    const updated = current.includes(brand)
      ? current.filter((b: string) => b !== brand)
      : [...current, brand];
    onFiltersChange({ ...filters, brands: updated.length > 0 ? updated : undefined });
  };

  const handlePriceChange = (value: number[]) => {
    setPriceRange(value);
  };

  const applyPriceFilter = () => {
    onFiltersChange({
      ...filters,
      priceRange: { min: priceRange[0], max: priceRange[1] },
    });
  };

  const handleInStockToggle = () => {
    onFiltersChange({ ...filters, inStock: !filters.inStock });
  };

  const clearAllFilters = () => {
    setPriceRange([0, 2000]);
    onFiltersChange({});
  };

  const hasActiveFilters = Object.keys(filters).length > 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Filters</CardTitle>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearAllFilters}>
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {aggregations.categories.length > 0 && (
          <div>
            <h3 className="mb-3 font-semibold">Categories</h3>
            <div className="space-y-2">
              {aggregations.categories.map((category) => (
                <div key={category.key} className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${category.key}`}
                    checked={(filters.categories || []).includes(category.key)}
                    onCheckedChange={() => handleCategoryToggle(category.key)}
                  />
                  <label
                    htmlFor={`category-${category.key}`}
                    className="flex-1 cursor-pointer text-sm"
                  >
                    {category.key}
                    <span className="ml-1 text-zinc-500">({category.count})</span>
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        <Separator />

        {aggregations.brands.length > 0 && (
          <div>
            <h3 className="mb-3 font-semibold">Brands</h3>
            <div className="max-h-48 space-y-2 overflow-y-auto">
              {aggregations.brands.slice(0, 10).map((brand) => (
                <div key={brand.key} className="flex items-center space-x-2">
                  <Checkbox
                    id={`brand-${brand.key}`}
                    checked={(filters.brands || []).includes(brand.key)}
                    onCheckedChange={() => handleBrandToggle(brand.key)}
                  />
                  <label
                    htmlFor={`brand-${brand.key}`}
                    className="flex-1 cursor-pointer text-sm"
                  >
                    {brand.key}
                    <span className="ml-1 text-zinc-500">({brand.count})</span>
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        <Separator />

        <div>
          <h3 className="mb-3 font-semibold">Price Range</h3>
          <div className="space-y-4">
            <Slider
              min={0}
              max={2000}
              step={10}
              value={priceRange}
              onValueChange={handlePriceChange}
              className="w-full"
            />
            <div className="flex items-center justify-between text-sm">
              <span>${priceRange[0]}</span>
              <span>${priceRange[1]}</span>
            </div>
            <Button onClick={applyPriceFilter} size="sm" className="w-full">
              Apply
            </Button>
          </div>
        </div>

        <Separator />

        <div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="in-stock"
              checked={!!filters.inStock}
              onCheckedChange={handleInStockToggle}
            />
            <label htmlFor="in-stock" className="cursor-pointer text-sm font-semibold">
              In Stock Only
            </label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
