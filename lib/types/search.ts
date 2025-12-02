import { Product, ProductWithHighlight } from './product';

export interface SearchFilters {
  categories?: string[];
  brands?: string[];
  priceRange?: {
    min: number;
    max: number;
  };
  rating?: number;
  inStock?: boolean;
  tags?: string[];
}

export interface SearchSort {
  field: 'price' | 'rating' | 'name' | 'createdAt' | '_score';
  order: 'asc' | 'desc';
}

export interface SearchRequest {
  query: string;
  filters?: SearchFilters;
  sort?: SearchSort;
  page: number;
  pageSize: number;
}

export interface SearchAggregations {
  categories: Array<{ key: string; count: number }>;
  brands: Array<{ key: string; count: number }>;
  priceRange: {
    min: number;
    max: number;
  };
  avgRating: number;
}

export interface SearchResponse {
  hits: ProductWithHighlight[];
  total: number;
  took: number;
  aggregations: SearchAggregations;
}

export interface AutocompleteResponse {
  suggestions: string[];
  products: Product[];
}
