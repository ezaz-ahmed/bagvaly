# Bagvaly designs

Local copy of the Bagvaly page designs and design system, exported from claude.ai on 2026-11-13.
Sources (owner access only):

- Page designs, *Bagvaly Storefront* canvas: https://claude.ai/artifact/JmQhtoaWBcsB2V4F85rHhj
- Design system: https://claude.ai/artifact/UMBRACereABa9ThFx771F7

## Boards

| File | Board | Width |
|---|---|---|
| `Main.dc.html` | Home · mobile | 390 |
| `HomeDesktop.dc.html` | Home · desktop | 1440 |
| `Shop.dc.html` | Shop · mobile | 390 |
| `Product.dc.html` | Product · mobile | 390 |
| `Cart.dc.html` | Cart · mobile | 390 |
| `Checkout.dc.html` | Checkout · mobile | 390 |
| `Confirmed.dc.html` | Order confirmed · mobile | 390 |
| `AdminDashboard.dc.html` | Admin · Dashboard | 1440 |
| `AdminOrders.dc.html` | Admin · Orders | 1440 |
| `AdminOrder.dc.html` | Admin · Order detail | 1440 |
| `AdminProducts.dc.html` | Admin · Products | 1440 |
| `AdminProductEdit.dc.html` | Admin · Edit product | 1440 |

`design-system/` holds the brand book (`README.md`), `tokens.json`, the reference component CSS
(`components/bundle.css`), component types (`components/index.d.ts`) and per-component guidelines
(`components/*/README.md`).

## How to read the boards

- They are static mockups, not app code. Styles are inline; copy values, not markup.
- `<sc-for>` / `<sc-if>` and `{{…}}` are the design tool's template syntax. The `<script type="text/x-dc">`
  block at the bottom of each file holds the sample data and interaction state.
- Sample data (names, phone numbers, prices, counts, `[placeholders]`) is illustrative. Never ship it.
- The files reference `./support.js` from the design tool; it is not included, so they don't render
  standalone in a browser.

## Where the repo wins

- Fonts: Fraunces (headings), Manrope (body), Hind Siliguri (Bangla). The design-system README still
  mentions Cormorant Garamond and Hind Siliguri for everything; that is outdated.
- Colour token names come from `src/routes/layout.css`.
- Business rules come from `AGENTS.md`. Known differences in the designs:
  - The admin boards show a **Packed** order status that `AGENTS.md` doesn't have yet.
  - The product page shows an exact "Only 3 left" count; cached pages must not show exact stock.
  - The order detail board has a courier picker; the courier provider is not chosen yet.
  - `Cart.dc.html` has a stray "All bags / 48 bags" heading under the header. Ignore it.
  - Search and wishlist icons appear in headers but those features aren't designed.
