export interface Product {
  id: string;
  name: string;
  description: string;
  brand: string;
  category: string;
  subcategory?: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  rating: number;
  reviewCount: number;
  imageUrl: string;
  images?: string[];
  inStock: boolean;
  stockCount: number;
  tags: string[];
  features?: string[];
  specifications?: Record<string, string>;
  color?: string;
  size?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductWithHighlight extends Product {
  highlight?: {
    name?: string[];
    description?: string[];
  };
}
