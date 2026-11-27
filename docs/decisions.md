# Decisions

Short record of significant decisions and why they were made. Newest first.

## 2026-11-20: Cache key keeps only page params; navigation data is not cached

The edge cache key is the path plus `category`, `sort` and `cursor` only. Ad clicks add a unique
`fbclid` and `utm_*` tags, so a full-URL key missed the cache for nearly all campaign traffic.
Attribution is read from the address in the browser, so it does not need the key. SvelteKit's
`__data.json` (client-side navigation) is no longer cached, because purges list page URLs only
and a cached copy would outlive an admin edit.

## 2026-11-13: Edge cache for public pages and purge by URL

Approved in issue #62. `cachedPublic()` in `src/lib/server/cache.ts` (or the `publicCacheHandle()`
hook for a list of public route IDs) stores public pages in `caches.default`, keyed by the full
URL, so each locale (`/`, `/bn/`) and query string is its own entry. TTL is 5 minutes
(`s-maxage=300`, which browsers ignore, so a purge reaches shoppers). It only caches GET requests
without a Better Auth cookie or `Authorization`, and only 200 responses without `Set-Cookie` or
`Cache-Control: private/no-store`. It is a pass-through in dev and while prerendering. Pages
built from catalogue queries show `inStock` booleans only, never stock counts.

`cache.delete()` only clears the current data center, so invalidation uses Cloudflare's
purge-by-URL API (`src/lib/server/providers/cloudflare/purge.ts`), which also clears Cache API
entries on the zone's custom domain (not `workers.dev`). `affectedUrls()` lists home, `/shop`,
`/shop?category=` and `/bags/<slug>` in both locales. Other sorts and later pages expire after the
TTL. Requests send at most 100 URLs, the documented per-request limit on Free/Pro/Business plans.
`CACHE_PURGE_TOKEN` (an API token with only Zone > Cache Purge) is a secret in
`secrets.required` for production and staging. `CACHE_PURGE_ZONE_ID` is a Worker var, because a
zone ID is an identifier, not a credential, and it differs per environment. Both are empty
locally. Purging is skipped in dev, and a deployed Worker without them logs a warning and
returns `false` instead of claiming to purge. Admin edits will call `purgeUrls(affectedUrls(...))`
once the admin exists.

## 2026-11-13: Orders, customers and atomic order creation

Approved schema from issue #61: `customers` (one per canonical phone, blocking, order/delivered/
returned counts), `orders`, `order_items` and `order_events`. No `packed` status: the lifecycle
stays as in `AGENTS.md`, enforced by `changeStatus()` in `src/lib/server/orders/status.ts`. One
order line holds at most `MAX_QTY_PER_LINE` = 5. Items snapshot the product and colour names (both
languages) and the unit price; their product/variant links become NULL if those are deleted.
`hidden` products can be ordered (they are only left off listings); `draft` ones cannot.

D1 has no interactive transactions (Drizzle's `db.transaction()` sends `BEGIN`, which D1
rejects), but `db.batch()` passes straight to `D1Database.batch()`, which runs the statements as
one SQL transaction: if any statement fails, the whole batch rolls back (Cloudflare D1 docs;
Miniflare runs it inside `storage.transaction()`; covered by a test). A statement that changes 0
rows does not fail, so the guards are constraint violations instead:

- `createOrder()` reads prices and stock, then writes customer upsert, order, items, first event
  and `stock = stock - qty` in one batch. `CHECK (stock >= 0)` fails the batch if another order
  took the stock in between, so two orders for the last unit give exactly one order.
- `changeStatus()` writes the event first, with `order_id` taken from
  `SELECT id FROM orders WHERE id = ? AND status = <from>`. If the status changed meanwhile it is
  NULL, the NOT NULL constraint fails and nothing (status, restock, counters) is written.
- Statements reference the new order by its unique `idempotency_key`, never by an id read earlier.
  A duplicate key fails the batch and the existing order is returned.

Order numbers are `BV-` + (10000 + max order id + 1), computed inside the insert. D1 serialises
writes, so this cannot race, and the column is UNIQUE as a backstop. Orders must never be deleted
(a deleted newest order would let its number be reused).

## 2026-11-13: Catalogue schema

Approved schema from issue #60: `categories`, `products`, `product_variants` (one row per colour,
with its own SKU and stock) and `product_images`. IDs are integer `AUTOINCREMENT`, so a deleted
row's ID is never handed out again. Prices are integer poisha, with CHECKs for `price >= 0`,
`compare_at_price > price` and `stock >= 0`, and a status CHECK (`published`, `draft`, `hidden`).
Bangla text columns are `NOT NULL DEFAULT ''`; an empty value shows the English text
(`src/lib/localized.ts`). Deleting a category with products is refused; deleting a product
removes its variants and image rows (R2 objects must be cleaned up separately), and deleting a
colour keeps its photos as general product photos. Occasions (home page) are left for later.

## 2026-11-13: Gitleaks secret scan in CI

A GitHub Actions workflow runs Gitleaks (pinned release, checksum-verified, no project
dependency) over the full history on every push and pull request, with values redacted.
`.gitleaksignore` holds two fingerprinted findings from commit `31fe87a` (2023 Supabase
prototype). The first is a false positive: Supabase's public local-demo key. The second is a
real Supabase project `anon` key that is public in history; the owner confirmed it is deleted, so
it is ignored as revoked. History is not rewritten, because that would not un-publish it.

## 2026-11-13: One local env file, secrets declared in Wrangler

SvelteKit reads `$app/env/private` from `.env` in `vp dev` and during the build (prerendering
fails if a value is missing), while Wrangler stops reading `.env` once a `.dev.vars` exists. A
`.dev.vars` would therefore duplicate `ORIGIN` and `BETTER_AUTH_SECRET`, so there is none: all
local values live in the ignored `.env`. `secrets.required` in `wrangler.jsonc` lists the Worker
secrets, so only those reach the local Worker and its generated `Env` type. Tooling credentials
(`CLOUDFLARE_*` for drizzle-kit) stay out of the Worker. Deployed secrets are set with
`wrangler secret put`.

`ORIGIN` is not secret, so it is a Worker `var`, per environment. It stays empty until the
domains are chosen, so a deployed Worker fails validation instead of running with a wrong
origin; `.env` overrides it locally.

The top level of `wrangler.jsonc` is production and `env.staging` is staging, each with its own
D1 and R2 (placeholder IDs until created). Local development always uses Wrangler's local D1 and
R2 emulation. `CLOUDFLARE_DATABASE_ID` (drizzle-kit) must match the `database_id` of the remote
environment being targeted. There is no Images binding: images use URL-based
`/cdn-cgi/image` transformations.

## 2026-10-31: Worker types are generated, not committed

`wrangler types` adds a `mainModule` type when the build output exists, so the file differs
before and after a build and `wrangler types --check` failed on every second build.
`worker-configuration.d.ts` is now ignored by Git and regenerated by `prepare`, `check` and
`build`. `checkJs` is off so generated JavaScript (build output, Paraglide) is not type-checked;
all hand-written code is TypeScript.

## 2026-10-31: Bindings come from `cloudflare:workers`

`@sveltejs/adapter-cloudflare` 8 does not populate `event.platform`. Server code reads bindings
and `waitUntil` with `import { env, waitUntil } from 'cloudflare:workers'`.

## 2026-10-31: Phone-number OTP is the only login method

Better Auth uses the `phoneNumber` plugin; email/password is off and no OAuth providers are
configured. Better Auth requires an email on each user, so sign-up stores a placeholder
`<number>@phone.invalid` address. Phone numbers must be in canonical `+8801XXXXXXXXX` form
(`src/lib/phone.ts`) before they reach the auth API.

No SMS gateway has been chosen. The SMS adapter prints the OTP on the dev server and refuses to
send in any build, so staging and production fail closed until a gateway is integrated.
Turnstile and per-phone/per-IP rate limits are still to be added with the login UI.

## 2026-10-31: Self-hosted fonts via Fontsource

Fraunces uses the `full` variable build because the headings use both the SOFT and optical-size
axes. That build is about 121 KB for Latin, compared with about 67 KB for a two-axis build.
Revisit this if heading font weight becomes a measurable loading problem on mobile. Hind Siliguri
loads only the Bengali subset, at weights 400 and 600.
