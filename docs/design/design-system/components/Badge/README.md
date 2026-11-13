# Badge

A short status label over a product image; at most two per card.

| Tone | Ground | Text | When |
|---|---|---|---|
| `new` | `color-burgundy-100` | `color-burgundy-600` | Added in the last 30 days |
| `sale` | `color-burgundy-600` | `color-ivory-50` | Discounted products |
| `low-stock` | `color-warning-100` | `color-warning-600` | 3 or fewer left |
| `sold-out` | `color-sand-200` | `color-ink-600` | Out of stock (the card dims to 60%) |

Radius `radius-pill`, padding 4px 10px, `text-xs` weight 600, UPPERCASE with `tracking-label` (Bangla labels drop the uppercase and tracking). The consumer may pass a label as children; otherwise the tone's English word is used.

Contrast note: `sold-out` text (`color-ink-600` on `color-sand-200`) is 4.4:1, just under 4.5:1 at 12px; kept exact from the source.
