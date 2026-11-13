**Everyday elegance, made affordable.**

Bagvaly sells ladies' bags in Bangladesh. The site must feel like a premium boutique, yet be as easy to shop as a Facebook page: fast on mobile data, simple to browse, and checkout in under a minute with Cash on Delivery.

Read this before building any page, component or email. Use the tokens; never hard-code colours, sizes or fonts. When briefing Claude on Bagvaly work, include:

> Follow the Bagvaly design system. Use the color, type, spacing and radius tokens only. Burgundy is the primary brand color. Mobile first, 2-column product grid on phones. Checkout is single page, guest-friendly, Cash on Delivery only. Support English and Bangla. Prices use the ৳ symbol. Do not add new colors, fonts or shadows.

For a new screen, name the page and the components, for example: "Build the product detail page using ProductCard, primary and secondary Button, Price and TrustStrip."

## Principles

1. **Luxury without the friction.** Generous whitespace and beautiful photography, but every price, size and delivery detail is visible without a click.
2. **Mobile first.** Around 90% of visitors come from Bangladesh, most on phones. Design the 390px screen first, then scale up.
3. **Show the bag.** Photography leads. Show products large, from several angles, with a real-life scale reference (hand, shoulder) where possible.
4. **Trust at every step.** A clear delivery promise, COD reassurance, easy returns, and a phone number that always works.
5. **Speak both languages.** Every screen works in English and Bangla (বাংলা). Bangla text gets more line height and never truncates.

## Content fundamentals

- Warm, confident, never pushy: "Find your everyday bag", not "BUY NOW!!!".
- Short sentences. Bangla copy is natural spoken Bangla, not translated English.
- State prices plainly. Never hide a fee in fine print.
- Address the customer as "you". Avoid jargon like "checkout flow" in customer-facing text.
- UPPERCASE only for short labels ("NEW", "BEST SELLER"), never sentences. No emoji.
- Standard phrases:

| English | Bangla |
|---|---|
| Add to cart | কার্টে যোগ করুন |
| Place order | অর্ডার করুন |
| Cash on delivery | ক্যাশ অন ডেলিভারি |

Prices: **৳ 1,450**. Symbol first, a space, comma thousands separator, English numerals by default (Bangla numerals optional). Never a price without ৳. Use `Price` or `formatPrice`.

## Logo

Use the wordmark files in the Logos group, chosen by ground: burgundy on ivory or white (default), ivory on burgundy, dark photos and the footer, ink for print. Minimum 120px wide on screen, 30mm in print; clear space of the "B"'s height on every side. Never stretch, rotate, shadow or recolour it, and never put the tagline inside the logo: set "Everyday elegance, made affordable." as text beside or below it. The favicon is the handbag "B" alone, cropped, on burgundy.

## Colour

Brand colours come from the logo and must not drift. In components, use the semantic aliases: `bg-page`, `bg-surface`, `bg-muted`, `bg-brand`, `bg-selected`, `text-primary`, `text-secondary`, `text-brand`, `text-accent`, `text-on-brand`, `border-default`, `border-strong`, `focus-ring`.

- The page canvas is `bg-page` (`color-ivory-50`). Cards and inputs sit on it in `bg-surface` (white).
- Use burgundy (`color-burgundy-600`) for no more than about 10% of any screen. Let photography and ivory do the rest.
- The primary button is `bg-brand` with `text-on-brand`; hover and pressed is `color-burgundy-700`. Never burgundy on burgundy.
- Never set gold text on ivory: `color-gold-400` is decorative only (dividers, icons, sparkle); use `color-gold-700` for accent text, links, discounts and "Free delivery".
- Body text is `text-primary` (`color-ink-900`); captions `text-secondary` (`color-ink-600`). Never pure black `#000`.
- Status colours (`color-success-*`, `color-warning-*`, `color-error-*`) are for feedback only, never decoration, and always come with an icon and words.
- Use only the text and ground pairs named in each token's note; do not invent new ones.

Known contrast gaps, kept exact from the source: `focus-ring` (`color-gold-400`) is 2.5:1 on ivory and 2.7:1 on white, and `border-default` (`color-sand-300`) is about 1.6–1.7:1, both under the 3:1 WCAG asks of focus indicators and control borders; Sold out badge text (`color-ink-600` on `color-sand-200`) is 4.4:1. Raise these with the brand owner before changing them.

## Typography

Two families, loaded from Google Fonts (weights 400–600 only):

- **Display: Cormorant Garamond** (500, 600), `font-display`. It echoes the logo's serif. Use it for headlines, product names on detail pages and prices in hero moments: `hero-title`, `hero-subtitle`, `page-title`, `section-heading`.
- **Body and UI: Hind Siliguri** (400, 500, 600), `font-body`. It covers Latin and Bangla in one family, so mixed-language text stays consistent: `lead`, `body`, `price`, `meta`, `label`.
- Cormorant has no Bangla glyphs, so Bangla display text falls back to Hind Siliguri automatically. Do not hand-pick another Bangla font.

Rules:

- The scale is `text-xs` 12 · `text-sm` 14 · `text-base` 16 · `text-lg` 18 · `text-xl` 22 · `text-2xl` 28 · `text-3xl` 36 · `text-4xl` 44px, rising to 64px from 768px.
- Body text never goes below `text-base` (16px). Inputs are 16px minimum, which also stops iOS zooming.
- Reading text runs 60 to 75 characters a line.
- Headings use `leading-tight` and `tracking-display`; product names `leading-snug`; body `leading-normal` (1.6).
- Bangla always uses `leading-normal` or taller, and is never clamped to fewer lines than English.
- Prices are weight 600, never italic. `tracking-label` is for UPPERCASE short labels only.

## Spacing, layout and touch

- Base unit 4px. Use only the `space-*` steps.
- Container max `container-max` (1200px); side padding `container-pad`: 16px on mobile, 32px from 768px.
- The product grid (`.bv-grid`) is **2 columns on mobile**, 3 on tablet, 4 on desktop. Two columns is the sweet spot for thumb browsing.
- Buttons, inputs and filter chips are at least `tap-min` (48px) high, with `space-2` (8px) between adjacent targets.
- Header `header-h`: 64px on mobile, 80px on desktop.
- Breakpoints: mobile 0–767px is the default; desktop from 768px.

## Shape and elevation

- `radius-sm` (6px) for inputs and small chips, `radius-md` (12px) for buttons, `radius-lg` (20px) for product cards, sheets and modals, `radius-pill` for badges and filter pills.
- Cards at rest take `shadow-sm`, or no shadow with a `border-default` border. Card hover (desktop only) takes `shadow-md` plus a 2px lift. The cart drawer and modals take `shadow-lg`.
- Shadows are warm (tinted ink or burgundy). Never grey `rgba(0,0,0,…)` shadows.

## Photography

Photography sells the bag; treat it as part of the system.

- Product images are **4:5 portrait** everywhere: cards, detail page, cart thumbnails. Never mix ratios within one grid.
- Backgrounds are soft, warm and neutral: ivory, sand, or a clean light grey. No clutter.
- At least four images per product: front, side, inside, on-model or in-hand. Add a zoom on hardware (clasp, stitching, strap): it builds trust for affordable bags.
- Lifestyle shots show real Bangladeshi women carrying the bags in everyday settings (Dhaka streets, office, wedding, Eid). Authentic, not stock-model polish.
- Product videos come from YouTube, embedded on the product page as a secondary tab, never autoplaying.
- Serve through Cloudflare Image Transformations; under 150KB per card image on mobile.
- Alt text on every product image: "[Color] [style] bag, [key detail]", e.g. "Burgundy quilted shoulder bag with gold chain".

## Iconography

Icons are 24px line icons, 1.75px stroke, drawn in `currentColor` (`Icon`). Trust-strip icons are `color-gold-700`; header icons `text-primary`. Pair icons with text in cart and checkout. The sources ship no icon set, so the `Icon` set here is a generic substitute: replace it with the brand's own when one exists.

## Motion

- Motion confirms an action, never decorates.
- Use `ease-standard`, with `dur-fast` (150ms) for taps, `dur-base` (240ms) for panels and `dur-slow` (480ms) for page-level reveals.
- Product images fade in softly as they load. No parallax, no autoplay carousels.
- Respect `prefers-reduced-motion`: all durations drop to 0.

## Components and pages

Build screens from the components: `Header`, `TrustStrip`, `FilterChip` in a `FilterChipRow`, `ProductCard` in `.bv-grid`, `Price`, `Badge`, `Button`, `QuantityStepper`, `CartLine`, `TextField`, `OrderSummary`, `Toast`, `Footer`, `Icon`.

| Page | Priority content |
|---|---|
| Home | Hero (one bag, one headline, one primary button), category row, new arrivals grid, trust strip, Facebook/WhatsApp contact |
| Shop | Filter chips, 2-column grid on mobile, sort, infinite scroll or "Load more" |
| Product | Swipe gallery, name, price, colour swatches, size if any, quantity, Add to cart (sticky on mobile), delivery estimate, details, FAQ |
| Cart | Line items, subtotal, delivery and total, sticky Checkout button (a bottom sheet on mobile) |
| Checkout | Single page, guest-friendly, COD only, fixed summary |
| Order confirmed | Order number, delivery window, "Track by phone", WhatsApp link; SMS or WhatsApp confirmation |
| Account | Optional. Order history by phone number via SMS code |

- Hero: one bag, one headline, one primary button. No auto-rotating carousels.
- Checkout needs no account; the phone number is the key field. Fields in order: Full name, Mobile number (01XXXXXXXXX, 11 digits), Delivery address, District, Area or landmark (optional), Order notes (optional). Payment is Cash on Delivery, "Pay when your bag arrives." The order button carries the total: "Place order · ৳ 1,450".

## Accessibility

- Text contrast at least 4.5:1, using the pairs in the token notes.
- Every interactive target at least 48px, with a visible focus ring.
- Icons paired with text labels in checkout and cart.
- Forms use `<label>` elements and `autocomplete`.
- Every image has alt text.
- Works at 200% zoom and in Bangla with longer strings.
- Test on a mid-range Android phone on a slow connection (3G throttle).

## Performance budget

- Initial page weight under 300KB excluding images.
- Largest Contentful Paint under 2.5s on 4G.
- Product card images under 150KB each.
- Two font families at most, weights 400 to 600 only.
