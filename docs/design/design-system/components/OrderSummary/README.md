# OrderSummary

Subtotal, delivery and total, with the Cash on Delivery promise and a slot for the order button.

- Delivery is always shown before checkout, never revealed at the last step. A `delivery` of 0 shows `deliveryLabel` ("Free").
- The payment note is Cash on Delivery, the default and only option: "Pay when your bag arrives." (ক্যাশ অন ডেলিভারি). Turn it off with `showPayment={false}` in the cart.
- On checkout keep it visible while scrolling: `sticky` pins it to the bottom with `shadow-lg` on mobile.
- Put the primary Button inside as children, showing the total: "Place order · ৳ 2,960".

The consumer provides `subtotal`, `delivery`, `itemCount` and, for Bangla, `labels`.
