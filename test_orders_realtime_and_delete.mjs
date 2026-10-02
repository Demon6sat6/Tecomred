export default async function run(page, ui) {
  if (!process.env.ADMIN_PASSWORD) throw new Error('Set ADMIN_PASSWORD to run this legacy browser check');
  // 1. Iniciar sesión en el admin
  await page.goto("http://localhost:4173/admin");
  await page.waitForTimeout(500);

  await page.locator('input[type="text"]').first().fill(process.env.ADMIN_USER || 'admin');
  await page.locator('input[type="password"]').first().fill(process.env.ADMIN_PASSWORD);
  await page.locator('button[type="submit"]').first().click();
  await page.waitForTimeout(600);

  // 2. Ir a Pedidos
  await page.goto("http://localhost:4173/admin/pedidos");
  await page.waitForTimeout(800);

  // 3. Crear un pedido nuevo como cliente
  const testOrderId = `TR-TEST-${Date.now().toString().slice(-4)}`;
  const orderPayload = {
    id: testOrderId,
    customer: "Cliente Automatizado",
    email: "auto@cliente.pe",
    phone: "+51 987 111 222",
    date: new Date().toLocaleDateString("es", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
    total: 890.0,
    discount: 0,
    couponCode: "",
    status: "Pendiente",
    city: "Lima",
    address: "Av. Larco 100, Miraflores",
    notes: "Pedido automático de verificación",
    items: [
      { productId: 2, name: "Router MikroTik RB4011", qty: 1, price: 890.0 },
    ],
  };

  await page.evaluate(async (payload) => {
    await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  }, orderPayload);

  // Esperar a que el polling o broadcast en tiempo real lo refleje
  await page.waitForTimeout(4000);

  const contentAfterAdd = await page.content();
  const addedVisible =
    contentAfterAdd.includes(testOrderId) ||
    contentAfterAdd.includes("Cliente Automatizado");

  // 4. Ahora eliminar ese pedido desde el admin (abrir modal delete y confirmar)
  // Evaluamos deleteOrder o eliminamos vía API/UI
  await page.evaluate(async (id) => {
    const token = localStorage.getItem("admin_token");
    if (!token) throw new Error('Missing administrator session');
    await fetch(`/api/orders/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
  }, testOrderId);

  // 5. Recargar la página para verificar que NO vuelve a aparecer
  await page.reload();
  await page.waitForTimeout(1500);

  const contentAfterReload = await page.content();
  const deletedStillGone = !contentAfterReload.includes(testOrderId);

  return {
    testOrderId,
    addedVisible,
    deletedStillGone,
    verifiedSuccessfully: addedVisible && deletedStillGone,
  };
}
