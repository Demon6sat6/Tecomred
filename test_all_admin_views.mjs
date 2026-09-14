export default async function run(page, ui) {
  const routes = [
    { path: '/admin/dashboard', expected: 'Panel' },
    { path: '/admin/analytics', expected: 'Analytics' },
    { path: '/admin/productos', expected: 'Productos' },
    { path: '/admin/medios', expected: 'Biblioteca de Medios' },
    { path: '/admin/categorias', expected: 'Categorías' },
    { path: '/admin/pedidos', expected: 'Pedidos' },
    { path: '/admin/clientes', expected: 'Clientes' },
    { path: '/admin/administradores', expected: 'Administradores' },
    { path: '/admin/resenas', expected: 'Resenas' },
    { path: '/admin/cupones', expected: 'Cupones' },
    { path: '/admin/seguimiento', expected: 'Seguimiento de trabajos' },
    { path: '/admin/nosotros', expected: 'Nosotros' },
    { path: '/admin/ajustes', expected: 'Ajustes' },
  ];

  // Navigate to login
  await page.goto('http://localhost:4173/admin');
  await page.waitForTimeout(400);

  // Login
  await page.locator('input[type="text"]').first().fill('admin');
  await page.locator('input[type="password"]').first().fill('tecomred2026');
  await page.locator('button[type="submit"]').first().click();
  await page.waitForTimeout(600);

  const results = [];

  for (const r of routes) {
    await page.goto(`http://localhost:4173${r.path}`);
    await page.waitForTimeout(400);
    const content = await page.content();
    const hasExpected = content.includes(r.expected);
    results.push({ path: r.path, expected: r.expected, passed: hasExpected });
  }

  const allPassed = results.every(r => r.passed);
  return { allPassed, results };
}
