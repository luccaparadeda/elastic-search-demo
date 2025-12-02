'use client';

import { useEffect, useState, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Search, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDebounce } from '@/lib/hooks/use-debounce';
import { AutocompleteResponse } from '@/lib/types/search';
import { Card } from '@/components/ui/card';

interface SearchBarProps {
  query: string;
  onQueryChange: (query: string) => void;
}

export function SearchBar({ query, onQueryChange }: SearchBarProps) {
  const [suggestions, setSuggestions] = useState<AutocompleteResponse | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!debouncedQuery || debouncedQuery.length < 2) {
        setSuggestions(null);
        setShowSuggestions(false);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(`/api/elasticsearch/suggest?q=${encodeURIComponent(debouncedQuery)}`);
        if (response.ok) {
          const data: AutocompleteResponse = await response.json();
          setSuggestions(data);
          setShowSuggestions(true);
        }
      } catch (error) {
        console.error('Autocomplete error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, [debouncedQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!suggestions || !showSuggestions) return;

    const totalItems = suggestions.suggestions.length + suggestions.products.length;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < totalItems - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      if (selectedIndex < suggestions.suggestions.length) {
        onQueryChange(suggestions.suggestions[selectedIndex]);
      } else {
        const productIndex = selectedIndex - suggestions.suggestions.length;
        onQueryChange(suggestions.products[productIndex].name);
      }
      setShowSuggestions(false);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    onQueryChange(suggestion);
    setShowSuggestions(false);
    setSelectedIndex(-1);
  };

  const hasSuggestions = suggestions && (suggestions.suggestions.length > 0 || suggestions.products.length > 0);

  return (
    <div className="relative" ref={wrapperRef}>
      <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
      <Input
        type="text"
        placeholder="Search for products..."
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => hasSuggestions && setShowSuggestions(true)}
        className="h-12 pl-10 pr-10 text-base"
      />
      {loading && (
        <Loader2 className="absolute right-10 top-1/2 h-5 w-5 -translate-y-1/2 animate-spin text-zinc-400" />
      )}
      {query && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-1 top-1/2 -translate-y-1/2"
          onClick={() => {
            onQueryChange('');
            setSuggestions(null);
            setShowSuggestions(false);
          }}
        >
          <X className="h-4 w-4" />
        </Button>
      )}

      {showSuggestions && hasSuggestions && (
        <Card className="absolute z-50 mt-2 w-full overflow-hidden bg-white shadow-lg dark:bg-zinc-900">
          {suggestions.suggestions.length > 0 && (
            <div className="border-b">
              <div className="px-3 py-2 text-xs font-semibold text-zinc-500">Suggestions</div>
              {suggestions.suggestions.map((suggestion, index) => (
                <button
                  key={`suggestion-${index}`}
                  className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 ${
                    selectedIndex === index ? 'bg-zinc-100 dark:bg-zinc-800' : ''
                  }`}
                  onClick={() => handleSuggestionClick(suggestion)}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <Search className="h-4 w-4 text-zinc-400" />
                  <span>{suggestion}</span>
                </button>
              ))}
            </div>
          )}

          {suggestions.products.length > 0 && (
            <div>
              <div className="px-3 py-2 text-xs font-semibold text-zinc-500">Products</div>
              {suggestions.products.map((product, index) => {
                const itemIndex = suggestions.suggestions.length + index;
                return (
                  <button
                    key={product.id}
                    className={`flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 ${
                      selectedIndex === itemIndex ? 'bg-zinc-100 dark:bg-zinc-800' : ''
                    }`}
                    onClick={() => handleSuggestionClick(product.name)}
                    onMouseEnter={() => setSelectedIndex(itemIndex)}
                  >
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="h-10 w-10 rounded object-cover"
                    />
                    <div className="flex-1 overflow-hidden">
                      <div className="truncate text-sm font-medium">{product.name}</div>
                      <div className="text-xs text-zinc-500">${product.price.toFixed(2)}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
