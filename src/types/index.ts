export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  image: string;
  description: string;
  specs: string[];
  stock: number;
  rating: number;
  reviews: number;
  badge?: 'Nuevo' | 'Oferta' | 'Popular' | 'Agotado';
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type Category =
  | 'Todos'
  | 'Switches'
  | 'Routers'
  | 'Cables'
  | 'Procesadores'
  | 'Memorias RAM'
  | 'Almacenamiento'
  | 'Tarjetas de Red'
  | 'Access Points'
  | 'Herramientas';
