import { createContext, useContext, type ReactNode } from 'react';
import type { CartItem, Product } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useAdmin } from './AdminContext';
import { isReferenceProduct } from '../utils/cartOrder';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [storedItems, setItems] = useLocalStorage<CartItem[]>('cart_items', []);
  const { products } = useAdmin();
  const purchasable = new Map(products.filter(p => p.isActive && (p.stock > 0 || isReferenceProduct(p))).map(p => [p.id, p]));
  const items = storedItems.flatMap(item => {
    const product = purchasable.get(item.product.id);
    return product ? [{ product, quantity: isReferenceProduct(product) ? item.quantity : Math.min(item.quantity, product.stock) }] : [];
  });

  const addToCart = (product: Product) => {
    setItems(prev => {
      const valid = prev.filter(i => purchasable.has(i.product.id));
      const existing = valid.find(i => i.product.id === product.id);
      if (existing) {
        const newQty = existing.quantity + 1;
        if (!isReferenceProduct(product) && newQty > product.stock) return valid; // limit to stock
        return valid.map(i =>
          i.product.id === product.id
            ? { ...i, quantity: newQty }
            : i
        );
      }
      if (!purchasable.has(product.id)) return valid;
      return [...valid, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: number) => {
    setItems(prev => prev.filter(i => i.product.id !== productId));
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems(prev =>
      prev.map(i => {
        if (i.product.id !== productId) return i;
        const maxQty = isReferenceProduct(i.product) ? 99 : i.product.stock;
        return { ...i, quantity: Math.min(quantity, maxQty) };
      })
    );
  };

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{
      items, addToCart, removeFromCart, updateQuantity,
      clearCart, totalItems, totalPrice,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
