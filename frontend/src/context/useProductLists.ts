import { createContext, useContext } from 'react';

export type CompareResult = 'added' | 'removed' | 'limit' | 'unavailable';

export interface ProductListsValue {
  favoriteIds: number[];
  compareIds: number[];
  isFavorite: (id: number) => boolean;
  isCompared: (id: number) => boolean;
  toggleFavorite: (id: number) => void;
  toggleCompare: (id: number) => CompareResult;
  clearCompare: () => void;
}

export const ProductListsContext = createContext<ProductListsValue | null>(null);

export function useProductLists() {
  const context = useContext(ProductListsContext);
  if (!context) throw new Error('useProductLists requiere ProductListsProvider');
  return context;
}
