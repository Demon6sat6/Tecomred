export default async function run(page, ui) {
  if (!process.env.ADMIN_PASSWORD) throw new Error('Set ADMIN_PASSWORD to run this legacy browser check');
  // Navigate to login
  await page.goto('http://localhost:4173/admin');
  await page.waitForTimeout(600);

  // Fill credentials
  await page.locator('input[type="text"]').first().fill(process.env.ADMIN_USER || 'admin');
  await page.locator('input[type="password"]').first().fill(process.env.ADMIN_PASSWORD);
  await page.locator('button[type="submit"]').first().click();

  await page.waitForTimeout(800);

  // Navigate to analytics
  await page.goto('http://localhost:4173/admin/analytics');
  await page.waitForTimeout(1000);

  // Take screenshot
  await page.screenshot({ path: 'screenshot_admin_analytics_live.png', fullPage: true });

  return { success: true };
}
