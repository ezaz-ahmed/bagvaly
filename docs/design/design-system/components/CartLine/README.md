# CartLine

One item in the cart: thumbnail, name, colour and size, quantity stepper, line total and Remove.

- Thumbnail is 4:5 and 72px wide on `bg-muted`.
- The line total is `unitPrice × quantity`, formatted as a Price.
- Remove is a ghost Button with a text label (never an icon alone).
- On mobile the cart is a bottom sheet (`radius-lg` top, `shadow-lg`) with a sticky full-width "Checkout" primary button below the lines.

The consumer provides the product fields, `quantity`, `onQuantityChange`, `onRemove` and, for Bangla, `removeLabel`.
