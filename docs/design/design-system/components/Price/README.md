# Price

Formats taka the Bagvaly way: **৳ 1,450**, symbol first, a space, comma thousands, English numerals.

- Pass `amount` (and `original` when discounted). The original is struck through in `text-secondary` and the discount shows as "-20%" in `text-accent` (`color-gold-700`).
- Weight 600, never italic. `size="hero"` sets the current price in the display face for hero moments.
- Never show a price without the ৳ symbol; `formatPrice(n)` is exported for prices inside other text (e.g. the order button).
- Bangla numerals are optional; English numerals are the default for prices so they match orders.
