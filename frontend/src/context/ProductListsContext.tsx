import type { ReactNode } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useStore } from './StoreContext';
import { ProductListsContext, type CompareResult } from './useProductLists';

const EMPTY_IDS: number[] = [];
const COMPARE_LIMIT = 3;

export function ProductListsProvider({ children }: { children: ReactNode }) {
  const [storedFavorites, setFavorites] = useLocalStorage<number[]>('favorite_product_ids', EMPTY_IDS);
  const [storedCompare, setCompare] = useLocalStorage<number[]>('compare_product_ids', EMPTY_IDS);
  const { products } = useStore();
  const availableIds = new Set(products.map(product => product.id));
  const favoriteIds = storedFavorites.filter(id => availableIds.has(id));
  const compareIds = storedCompare.filter(id => availableIds.has(id)).slice(0, COMPARE_LIMIT);

  const toggleFavorite = (id: number) => {
    if (!availableIds.has(id)) return;
    setFavorites(previous => previous.includes(id) ? previous.filter(item => item !== id) : [...previous, id]);
  };

  const toggleCompare = (id: number): CompareResult => {
    if (!availableIds.has(id)) return 'unavailable';
    if (compareIds.includes(id)) {
      setCompare(previous => previous.filter(item => item !== id));
      return 'removed';
    }
    if (compareIds.length >= COMPARE_LIMIT) return 'limit';
    setCompare(previous => [...previous.filter(item => availableIds.has(item)), id]);
    return 'added';
  };

  return (
    <ProductListsContext.Provider value={{
      favoriteIds, compareIds,
      isFavorite: id => favoriteIds.includes(id),
      isCompared: id => compareIds.includes(id),
      toggleFavorite, toggleCompare,
      clearCompare: () => setCompare([]),
    }}>
      {children}
    </ProductListsContext.Provider>
  );
}
