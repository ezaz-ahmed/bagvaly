# ProductCard

One product in the shop grid: image, badges, name, price and colours, the whole card one tap target.

Anatomy, top to bottom: 4:5 image (`radius-lg` top corners, `bg-muted` while loading, fades in over `dur-slow`); up to two badges top-left; a wishlist heart top-right (40px target, its own button); the name in `text-lg`, two lines max at `leading-snug`; the price row (current weight 600 `text-primary`, original struck through, discount in `text-accent`); up to four colour swatches then "+2".

- Card ground `bg-surface` on `bg-page`, `radius-lg`, `shadow-sm` at rest; on desktop hover `shadow-md` plus a 2px lift.
- Text area padding `space-3`; no padding on the image.
- Lay cards out in `.bv-grid`: **2 columns on mobile**, 3 on tablet, 4 on desktop.
- No "Add to cart" on the grid on mobile: tapping opens the product page where colour and size are chosen.
- `soldOut` dims the card to 60% and adds the Sold out badge.
- Bangla names (`lang="bn"`) are never clamped.

The consumer provides `name`, `href`, `price`, `originalPrice`, a 4:5 `imageSrc` under 150KB, `imageAlt` written as "[Color] [style] bag, [key detail]", `badges`, `swatches` (product colours as data) and the wishlist state.
