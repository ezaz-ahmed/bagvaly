# TextField

A labelled input, select or textarea for checkout.

- Height 52px, `radius-sm`, 1.5px `border-default`, `bg-surface`, `text-base` (16px, which also stops iOS zoom).
- The label sits above the field and is always visible; never placeholder-only labels. Mark optional fields with `optional`.
- Focus: `color-burgundy-600` border plus the 3px `focus-ring`.
- Error: `color-error-600` border and a message below in `text-sm` with an icon and a short fix ("Enter 11 digits, starting 01").
- Pass `options` for a select (District), `multiline` for Order notes.

Checkout fields, in order: Full name, Mobile number (01XXXXXXXXX, 11 digits, `type="tel"`), Delivery address, District, Area or landmark (optional), Order notes (optional). The consumer always sets `type` and `autoComplete`, and owns validation.

Contrast note: the resting border (`color-sand-300`) is 1.7:1 on white, under the 3:1 WCAG asks of control borders; kept exact from the source.
