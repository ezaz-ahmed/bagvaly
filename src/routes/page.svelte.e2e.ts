import { expect, test } from '@playwright/test';

test('home page renders the hero and new arrivals', async ({ page }) => {
	const response = await page.goto('/');
	// A Set-Cookie would keep the page out of the edge cache (src/lib/server/cache.ts).
	expect(response?.headers()['set-cookie']).toBeUndefined();
	await expect(page.locator('h1')).toHaveText('One bag for every you.');
	await expect(page.locator('html')).toHaveAttribute('lang', 'en');
	await expect(page).toHaveTitle("Bagvaly · Ladies' bags with cash on delivery");
	await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute('content', 'en_US');

	// Up to 4 cards; the local D1 may be empty (unseeded), which shows the empty message instead.
	const section = page.getByRole('region', { name: 'New arrivals' });
	const cards = section.locator('ul > li a');
	const count = await cards.count();
	expect(count).toBeLessThanOrEqual(4);
	if (count === 0) await expect(section.getByText('New bags are on their way.')).toBeVisible();
	for (const card of await cards.all()) {
		await expect(card).toHaveAttribute('href', /^\/bags\/[^/]+$/);
	}
});

test('locale lives in the URL and the switch links to the other locale', async ({ page }) => {
	await page.goto('/?ref=x');
	const footer = page.locator('footer');
	await expect(footer.getByRole('link', { name: 'বাংলা' })).toHaveAttribute('href', '/bn?ref=x');

	await page.goto('/bn');
	await expect(page.locator('html')).toHaveAttribute('lang', 'bn');
	await expect(page.locator('h1')).toHaveText('আপনার প্রতিটি রূপের জন্য একটি ব্যাগ।');
	await expect(page).toHaveTitle('ব্যাগভ্যালি · ক্যাশ অন ডেলিভারিতে মেয়েদের ব্যাগ');
	await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/bn$/);
	await expect(footer.getByRole('link', { name: 'English' })).toHaveAttribute('href', '/');
	await expect(page.getByRole('link', { name: 'কার্ট' })).toHaveAttribute('href', '/bn/cart');
});

test('phone tab bar marks the current tab and opens the menu', async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await page.goto('/');
	const tabs = page.getByRole('navigation', { name: 'Quick navigation' });
	await expect(tabs.getByRole('link', { name: 'Home' })).toHaveAttribute('aria-current', 'page');
	await expect(tabs.getByRole('link', { name: 'Shop' })).not.toHaveAttribute('aria-current');
	const button = tabs.getByRole('button', { name: 'Menu' });
	await button.click();
	const menu = page.getByRole('dialog', { name: 'Menu' });
	await expect(menu.getByRole('link', { name: 'Tote' })).toHaveAttribute(
		'href',
		'/shop?category=tote'
	);
	await page.keyboard.press('Escape');
	await expect(menu).toBeHidden();
	await expect(button).toBeFocused();
});
