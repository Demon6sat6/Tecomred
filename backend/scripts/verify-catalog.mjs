/** Comprobación de integración local del catálogo, con limpieza del producto de prueba. */
import { env } from '../dist/config/env.js';

const base = `http://127.0.0.1:${env.PORT}/api/products`;
const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${env.ADMIN_API_KEY}` };
let id;
async function request(url, options) {
  const response = await fetch(url, options);
  const body = await response.json();
  if (!response.ok) throw new Error(`${response.status}: ${body.error || 'Error de API'}`);
  return body;
}

try {
  const draft = {
    name: 'Verificación temporal del catálogo', category: 'Accesorios', price: 0,
    image: '/productos_tienda_tecnologia_20/13_hub_usb_c.png',
    description: 'Producto temporal de la prueba de integración.', specs: [],
    stock: 2, rating: 0, reviews: 0, isActive: false,
  };
  const created = await request(base, { method: 'POST', headers, body: JSON.stringify(draft) });
  id = created.data.id;
  if (created.data.isActive || created.data.price !== 0) throw new Error('El borrador no se guardó correctamente');
  const before = await request(`${base}?active=true`);
  if (before.data.some(product => product.id === id)) throw new Error('El borrador aparece en la tienda');
  const published = await request(`${base}/${id}`, {
    method: 'PUT', headers, body: JSON.stringify({ ...draft, price: 99, isActive: true }),
  });
  if (!published.data.isActive || published.data.price !== 99) throw new Error('La edición no persistió');
  const after = await request(`${base}?active=true`);
  if (!after.data.some(product => product.id === id)) throw new Error('El producto publicado no aparece en la tienda');
  const media = await request(`http://127.0.0.1:${env.PORT}/api/media`, { headers });
  if (!Array.isArray(media.data) || media.data.filter(file => file.url.startsWith('/productos_tienda_tecnologia_20/')).length !== 40) {
    throw new Error('La biblioteca de medios no contiene las 40 fotos');
  }
  const holdMs = Number(process.argv.find(arg => arg.startsWith('--hold-ms='))?.split('=')[1] || 0);
  if (holdMs > 0) {
    console.log('Producto temporal publicado para la prueba visual.');
    await new Promise(resolve => setTimeout(resolve, holdMs));
  }
  console.log('API y MySQL: crear borrador, publicar, listar y borrar correctamente.');
} finally {
  if (id) await request(`${base}/${id}`, { method: 'DELETE', headers });
}
