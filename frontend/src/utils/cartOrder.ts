import type { CartItem, Product } from '../types';

export const isReferenceProduct = (product: Product) =>
  product.image.startsWith('/productos_tienda_tecnologia_20/') && product.stock === 0;

export const cartPriceIsEstimated = (items: CartItem[]) =>
  items.some(({ product }) => isReferenceProduct(product) || product.price <= 0);

export function buildWhatsAppOrder(items: CartItem[], phone: string) {
  const digits = phone.replace(/\D/g, '');
  if (!digits || items.length === 0) return null;

  const lines = items.map(({ product, quantity }, index) => {
    const price = product.price > 0
      ? ` - desde S/${(product.price * quantity).toFixed(2)}`
      : ' - precio por confirmar';
    return `${index + 1}. ${product.name}\n   Cantidad: ${quantity}${price}`;
  });
  const total = items.reduce((sum, { product, quantity }) => sum + product.price * quantity, 0);
  const message = [
    'Hola, equipo de Siscomred! 👋',
    'Quisiera comprar estos productos:',
    '',
    ...lines.flatMap(line => [line, '']),
    total > 0 ? `Total referencial: S/${total.toFixed(2)}` : '',
    '¿Me confirman los modelos, la disponibilidad y el precio final? Gracias.',
  ].filter((line, index, all) => line || all[index - 1] !== '').join('\n');

  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
