/**
 * StoreContext — expone los productos del AdminContext a la tienda.
 * Así cuando el admin agrega/edita productos, la tienda los refleja.
 */
import { createContext, useContext } from 'react';
import type { Product } from '../types';
import { useAdmin } from './AdminContext';

interface StoreContextType {
  products: Product[];
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function useStore() {
  // Directly use admin products so store and admin share the same source
  const { products } = useAdmin();
  return { products };
}
