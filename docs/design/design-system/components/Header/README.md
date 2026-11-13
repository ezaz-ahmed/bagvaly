# Header

The sticky site header: wordmark, search and cart.

- Burgundy wordmark (`assets/Logos/bagvaly-wordmark-burgundy.svg`), left on mobile, centred from 768px; never narrower than 120px.
- Right side: search, cart with a count badge (`bg-brand` circle, `text-on-brand` number), account only if needed (`showAccount`).
- Height `header-h`: 64px mobile, 80px desktop. Sticky; set `scrolled` once the page has scrolled to show `shadow-sm`.
- Search opens as a full-width bar from the icon on mobile (the consumer renders it from `onSearch`).

The consumer provides `logoSrc`, `cartCount` and the handlers.
