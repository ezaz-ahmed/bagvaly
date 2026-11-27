import { expect, test, type Page } from '@playwright/test';

// These journeys need products: run `vp run db:seed:local` first. Orders use up local stock, so
// the order test buys whichever colour is in stock and skips when nothing is.

async function firstInStockProduct(page: Page) {
	await page.goto('/shop');
	const cards = page.locator('main ul > li a[href*="bags/"]');
	for (const card of await cards.all()) {
		if ((await card.getByText('Sold out').count()) === 0) return card.getAttribute('href');
	}
	return null;
}

test('shop filters by category and marks the active chip', async ({ page }) => {
	const response = await page.goto('/shop?category=tote');
	expect(response?.headers()['set-cookie']).toBeUndefined();
	await expect(page.locator('h1')).toHaveText('Tote');
	const filters = page.getByRole('group', { name: 'Filter by style' });
	await expect(filters.getByRole('link', { name: 'Tote' })).toHaveAttribute('aria-current', 'page');
	await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
		'href',
		/\/shop\?category=tote$/
	);

	expect((await page.goto('/shop?category=no-such-style'))?.status()).toBe(404);
});

test('a sold-out colour cannot be added to the bag', async ({ page }) => {
	const response = await page.goto('/bags/pearl-evening-clutch');
	test.skip(response?.status() !== 200, 'local D1 not seeded');
	// Hydration re-applies the default colour, so a click before it lands is undone.
	await page.waitForLoadState('networkidle');
	// The radio is visually hidden inside its swatch label; click the swatch like a shopper.
	await page.getByTitle('Ivory', { exact: true }).click();
	await expect(page.getByRole('radio', { name: /Ivory/ })).toBeChecked();
	await expect(page.getByText('Sold out in this colour')).toBeVisible();
	await expect(page.locator('#add-form').getByRole('button', { name: 'Sold out' })).toBeDisabled();
});

test('cash on delivery order: bag, checkout, confirmation', async ({ page }) => {
	const href = await firstInStockProduct(page);
	test.skip(!href, 'no product in stock in the local D1');

	await page.goto(href!);
	await page.locator('#add-form').getByRole('button', { name: 'Add to bag' }).click();
	await expect(page.getByRole('status').filter({ hasText: 'Added to your bag' })).toBeVisible();
	await expect(page.getByRole('link', { name: /Cart, 1 item/ })).toBeVisible();

	await page.goto('/cart');
	await page.getByRole('link', { name: /^Checkout/ }).click();
	await expect(page).toHaveURL(/\/checkout$/);

	// Validation runs on the server: a bad phone keeps the other values.
	await page.getByLabel('Full name').fill('Test Buyer');
	await page.getByLabel('Mobile number').fill('12345');
	await page.getByLabel('Delivery address').fill('House 1, Road 2');
	await page.getByLabel('District').selectOption('dhaka');
	await page.getByRole('button', { name: /^Place order/ }).click();
	await expect(page.getByText('Enter an 11-digit mobile number starting with 01.')).toBeVisible();
	await expect(page.getByLabel('Full name')).toHaveValue('Test Buyer');

	await page.getByLabel('Mobile number').fill('01712 345678');
	await page.getByRole('button', { name: /^Place order/ }).click();
	await expect(page).toHaveURL(/\/order\/BV-\d+$/);
	await expect(page.locator('h1')).toHaveText("Thank you, we've got your order");
	await expect(page.getByText('01712345678')).toBeVisible();

	// Only the browser that placed the order can open it.
	const url = page.url();
	await page.context().clearCookies();
	expect((await page.goto(url))?.status()).toBe(404);
});
