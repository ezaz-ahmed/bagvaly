import { expect, test } from '@playwright/test';

test('home page renders', async ({ page }) => {
	await page.goto('/');
	await expect(page.locator('h1')).toHaveText('Bagvaly');
	await expect(page.locator('html')).toHaveAttribute('lang', 'en');
});

test('locale lives in the URL and the switch links to the other locale', async ({ page }) => {
	await page.goto('/?ref=x');
	const footer = page.locator('footer');
	await expect(footer.getByRole('link', { name: 'বাংলা' })).toHaveAttribute('href', '/bn?ref=x');

	await page.goto('/bn');
	await expect(page.locator('html')).toHaveAttribute('lang', 'bn');
	await expect(page.locator('h1')).toHaveText('ব্যাগভ্যালি');
	await expect(footer.getByRole('link', { name: 'English' })).toHaveAttribute('href', '/');
	await expect(page.getByRole('link', { name: 'কার্ট' })).toHaveAttribute('href', '/bn/cart');
});

test('mobile menu opens, closes on Escape and returns focus', async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await page.goto('/');
	const button = page.getByRole('button', { name: 'Open menu' });
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
