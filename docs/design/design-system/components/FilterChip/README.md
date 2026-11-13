# FilterChip

A toggle for one filter value; chips sit in a `FilterChipRow` that scrolls sideways on mobile and never wraps.

- Height at least `tap-min` (48px), `radius-pill`, 1.5px `border-default` on `bg-surface`, `space-2` between chips.
- Selected (`selected`, exposed as `aria-pressed`): `bg-brand` with `text-on-brand`.
- Filters to offer: Category (Shoulder, Crossbody, Tote, Clutch, Backpack), Price (under ৳1000, ৳1000–2000, ৳2000+), Color, Sort.

The consumer owns selection state and passes `selected` and `onClick`; wrap the chips in `FilterChipRow` with a `label` naming the filter.

Contrast note: the chip border (`color-sand-300`) is 1.6:1 on ivory, under the 3:1 WCAG asks of control borders; kept exact from the source.
