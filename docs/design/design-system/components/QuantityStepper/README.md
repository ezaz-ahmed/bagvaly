# QuantityStepper

Minus, count, plus, for cart lines and the product page.

- Each button is `tap-min` (48px) square; the group has a 1.5px `border-default` outline and `radius-md`.
- The minus disables at `min` (default 1), the plus at `max` (default 10; pass the stock).
- The consumer provides `value` and `onChange`; the count is announced politely to screen readers.
