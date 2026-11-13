# Button

Buttons trigger one action; a view has exactly one primary.

- **Primary** (`bg-brand`, `text-on-brand`; hover `color-burgundy-700`): Add to cart, Place order. One per view, never two primaries side by side. Full width on mobile for primary actions (`fullWidth`), especially "Place order".
- **Secondary** (transparent, `text-brand`, 1.5px `color-burgundy-600` border): Continue shopping, View details.
- **Ghost** (transparent, `text-primary`): tertiary actions such as "Remove".
- Height 52px, horizontal padding `space-6`, radius `radius-md`, `text-base` weight 600.
- **Disabled:** `color-sand-300` fill, `color-ink-600` text, no shadow.
- **Loading:** pass `loading`; the label is hidden (not removed) under a small spinner so the width does not jump.

The consumer provides the label (English or Bangla, e.g. "কার্টে যোগ করুন" / "অর্ডার করুন") and `onClick`. Put the total in the order button: "Place order · ৳ 1,450". Never burgundy text on a burgundy fill.
