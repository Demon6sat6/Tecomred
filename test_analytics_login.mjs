export default async function run(page, ui) {
  // Navigate to login
  await page.goto('http://localhost:4173/admin');
  await page.waitForTimeout(600);

  // Fill credentials
  await page.locator('input[type="text"]').first().fill('admin');
  await page.locator('input[type="password"]').first().fill('tecomred2026');
  await page.locator('button[type="submit"]').first().click();

  await page.waitForTimeout(800);

  // Navigate to analytics
  await page.goto('http://localhost:4173/admin/analytics');
  await page.waitForTimeout(1000);

  // Take screenshot
  await page.screenshot({ path: 'c:/Users/Sat/OneDrive - SENATI/Desktop/TiendaTEc/screenshot_admin_analytics_live.png', fullPage: true });

  return { success: true };
}
