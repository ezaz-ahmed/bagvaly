/**
 * Fills the LOCAL D1 database with the six categories and the sample products from the designs.
 * Development only: placeholder data, never for staging or production.
 *
 *   vp run db:seed:local
 *
 * Safe to rerun: every insert is `ON CONFLICT DO NOTHING` on a unique key (slug or SKU), so existing
 * rows, including ones you edited locally, are left alone. The Wrangler command is fixed to `--local`
 * and the script takes no arguments, so it cannot be pointed at a remote database.
 */
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

if (process.argv.length > 2) {
	console.error('seed-catalog takes no arguments; it only ever seeds the local D1 database.');
	process.exit(1);
}

const categories = [
	['shoulder', 'Shoulder', 'শোল্ডার'],
	['tote', 'Tote', 'টোট'],
	['crossbody', 'Crossbody', 'ক্রসবডি'],
	['top-handle', 'Top-handle', 'টপ-হ্যান্ডেল'],
	['clutch', 'Clutch', 'ক্লাচ'],
	['backpack', 'Backpack', 'ব্যাকপ্যাক']
] as const;

const colours = {
	Burgundy: ['#790b27', 'BUR'],
	Black: ['#292525', 'BLK'],
	Ivory: ['#fdf7eb', 'IVO'],
	Tan: ['#b99a6b', 'TAN'],
	Sand: ['#e8dccf', 'SAN']
} as const;

type Colour = keyof typeof colours;

interface SeedProduct {
	slug: string;
	name: string;
	category: (typeof categories)[number][0];
	/** Whole taka, as shown in the designs. */
	price: number;
	was?: number;
	status: 'published' | 'draft' | 'hidden';
	sku: string;
	stock: [Colour, number][];
	isNew?: boolean;
	isBestSeller?: boolean;
	showOnHome?: boolean;
	description?: string;
	details?: { size: string; material: string; strapDrop: string; inside: string };
}

// From AdminProducts, Main and AdminProductEdit in docs/design/. Bangla left empty on purpose:
// the storefront shows English until it is added.
const products: SeedProduct[] = [
	{
		slug: 'quilted-chain-shoulder-bag',
		name: 'Quilted chain shoulder bag',
		category: 'shoulder',
		price: 1450,
		status: 'published',
		sku: 'BV-QCS',
		stock: [
			['Burgundy', 2],
			['Black', 6],
			['Ivory', 4],
			['Tan', 3]
		],
		isNew: true,
		showOnHome: true,
		description:
			'A soft quilted bag with a gold chain strap that works from office to evening. Fits a phone, wallet, keys and a small pouch.',
		details: {
			size: '24 × 16 × 8',
			material: 'PU leather',
			strapDrop: '55, adjustable',
			inside: '1 zip pocket, 2 slip pockets'
		}
	},
	{
		slug: 'everyday-canvas-tote',
		name: 'Everyday canvas tote',
		category: 'tote',
		price: 1850,
		status: 'published',
		sku: 'BV-ECT',
		stock: [
			['Ivory', 9],
			['Black', 5],
			['Tan', 7]
		],
		isBestSeller: true,
		showOnHome: true
	},
	{
		slug: 'mini-zip-crossbody',
		name: 'Mini zip crossbody',
		category: 'crossbody',
		price: 1250,
		was: 1550,
		status: 'published',
		sku: 'BV-MZC',
		stock: [
			['Black', 1],
			['Burgundy', 4]
		],
		showOnHome: true
	},
	{
		slug: 'structured-top-handle-bag',
		name: 'Structured top-handle bag',
		category: 'top-handle',
		price: 2150,
		status: 'published',
		sku: 'BV-STH',
		stock: [
			['Tan', 5],
			['Black', 3],
			['Burgundy', 4]
		],
		isNew: true,
		showOnHome: true
	},
	{
		slug: 'pearl-evening-clutch',
		name: 'Pearl evening clutch',
		category: 'clutch',
		price: 990,
		status: 'published',
		sku: 'BV-PEC',
		stock: [
			['Ivory', 0],
			['Black', 2]
		]
	},
	{
		slug: 'woven-bucket-bag',
		name: 'Woven bucket bag',
		category: 'shoulder',
		price: 1650,
		status: 'published',
		sku: 'BV-WBB',
		stock: [
			['Sand', 8],
			['Tan', 6]
		]
	},
	{
		slug: 'classic-work-satchel',
		name: 'Classic work satchel',
		category: 'top-handle',
		price: 2350,
		status: 'draft',
		sku: 'BV-CWS',
		stock: [
			['Burgundy', 10],
			['Black', 10]
		]
	},
	{
		slug: 'mini-backpack',
		name: 'Mini backpack',
		category: 'backpack',
		price: 1550,
		was: 1750,
		status: 'hidden',
		sku: 'BV-MBP',
		stock: [
			['Tan', 0],
			['Black', 0]
		]
	}
];

const q = (value: string) => `'${value.replaceAll("'", "''")}'`;
const bool = (value: boolean | undefined) => (value ? 1 : 0);

const statements = [
	...categories.map(
		([slug, en, bn], position) =>
			`INSERT INTO categories (slug, name_en, name_bn, position) VALUES (${q(slug)}, ${q(en)}, ${q(bn)}, ${position}) ON CONFLICT (slug) DO NOTHING;`
	),
	...products.flatMap((p) => [
		`INSERT INTO products (slug, name_en, description_en, category_id, price, compare_at_price, status, is_new, is_best_seller, show_on_home, size_en, material_en, strap_drop_en, inside_en, sku_prefix) VALUES (${[
			q(p.slug),
			q(p.name),
			q(p.description ?? ''),
			`(SELECT id FROM categories WHERE slug = ${q(p.category)})`,
			p.price * 100,
			p.was ? p.was * 100 : 'NULL',
			q(p.status),
			bool(p.isNew),
			bool(p.isBestSeller),
			bool(p.showOnHome),
			q(p.details?.size ?? ''),
			q(p.details?.material ?? ''),
			q(p.details?.strapDrop ?? ''),
			q(p.details?.inside ?? ''),
			q(p.sku)
		].join(', ')}) ON CONFLICT (slug) DO NOTHING;`,
		...p.stock.map(([colour, stock], position) => {
			const [hex, code] = colours[colour];
			return `INSERT INTO product_variants (product_id, colour_name_en, colour_hex, sku, stock, position) VALUES ((SELECT id FROM products WHERE slug = ${q(p.slug)}), ${q(colour)}, ${q(hex)}, ${q(`${p.sku}-${code}`)}, ${stock}, ${position}) ON CONFLICT (sku) DO NOTHING;`;
		})
	])
];

const dir = mkdtempSync(join(tmpdir(), 'bagvaly-seed-'));
const file = join(dir, 'seed-catalog.sql');
try {
	writeFileSync(file, statements.join('\n') + '\n');
	// Fixed argument list: always --local, never --remote.
	execFileSync('wrangler', ['d1', 'execute', 'DB', '--local', '--file', file], {
		stdio: 'inherit'
	});
} finally {
	rmSync(dir, { recursive: true, force: true });
}
