export interface AvailableFilters {
  categories: string[];
  brands: string[];
  priceRange: {
    min: number;
    max: number;
  };
  tags: string[];
}

export interface ActiveFilter {
  type: 'category' | 'brand' | 'price' | 'rating' | 'inStock' | 'tag';
  label: string;
  value: string | number | boolean | { min: number; max: number };
}
