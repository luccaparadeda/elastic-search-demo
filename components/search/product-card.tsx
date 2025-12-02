'use client';

import { ProductWithHighlight } from '@/lib/types/product';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';
import Image from 'next/image';

interface ProductCardProps {
  product: ProductWithHighlight;
}

export function ProductCard({ product }: ProductCardProps) {
  const renderName = () => {
    if (product.highlight?.name && product.highlight.name[0]) {
      return (
        <h3
          className="text-lg font-semibold line-clamp-2"
          dangerouslySetInnerHTML={{ __html: product.highlight.name[0] }}
        />
      );
    }
    return <h3 className="text-lg font-semibold line-clamp-2">{product.name}</h3>;
  };

  const renderDescription = () => {
    if (product.highlight?.description && product.highlight.description[0]) {
      return (
        <p
          className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2"
          dangerouslySetInnerHTML={{ __html: product.highlight.description[0] }}
        />
      );
    }
    return (
      <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">
        {product.description}
      </p>
    );
  };

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-lg">
      <div className="relative aspect-square overflow-hidden bg-zinc-100 dark:bg-zinc-800">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {!product.inStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <Badge variant="secondary">Out of Stock</Badge>
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <div className="mb-2">
          <Badge variant="outline" className="mb-2">
            {product.brand}
          </Badge>
          {renderName()}
        </div>
        {renderDescription()}
        <div className="mt-3 flex items-center gap-1">
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          <span className="text-sm font-medium">{product.rating.toFixed(1)}</span>
          <span className="text-sm text-zinc-500">({product.reviewCount})</span>
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between border-t p-4">
        <div>
          {product.discount ? (
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">${product.price.toFixed(2)}</span>
              <span className="text-sm text-zinc-500 line-through">
                ${product.originalPrice?.toFixed(2)}
              </span>
              <Badge variant="destructive" className="text-xs">
                -{product.discount}%
              </Badge>
            </div>
          ) : (
            <span className="text-2xl font-bold">${product.price.toFixed(2)}</span>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
