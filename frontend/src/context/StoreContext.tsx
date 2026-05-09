/**
 * useStore — expone los productos del AdminContext a la tienda.
 * Así cuando el admin agrega/edita productos, la tienda los refleja.
 */
import { useAdmin } from './AdminContext';

export function useStore() {
  const { products } = useAdmin();
  return { products };
}
