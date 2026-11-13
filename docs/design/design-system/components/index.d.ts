import type * as React from 'react';

export type IconName = 'search' | 'bag' | 'user' | 'heart' | 'truck' | 'cash' | 'return' | 'phone' | 'check' | 'alert' | 'minus' | 'plus' | 'close' | 'chevron';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** primary: Add to cart, Place order (one per view). secondary: Continue shopping, View details. ghost: tertiary, "Remove". */
  variant?: 'primary' | 'secondary' | 'ghost';
  /** Full width; use for primary actions on mobile. */
  fullWidth?: boolean;
  /** Replaces the label with a spinner and keeps the width. */
  loading?: boolean;
  /** Render as another element, e.g. 'a' with href. */
  as?: 'button' | 'a';
  href?: string;
}
export declare function Button(props: ButtonProps): React.ReactElement;

export interface BadgeProps {
  tone?: 'new' | 'sale' | 'low-stock' | 'sold-out';
  /** Defaults to the tone's English label (New, Sale, Low stock, Sold out). */
  children?: React.ReactNode;
  lang?: string;
}
export declare function Badge(props: BadgeProps): React.ReactElement;

export interface PriceProps {
  /** Current price in taka. Rendered "৳ 1,450". */
  amount: number;
  /** Original price; shown struck through, and the discount % is computed from it. */
  original?: number;
  /** Override the computed discount percentage. */
  discount?: number;
  size?: 'md' | 'lg' | 'hero';
}
export declare function Price(props: PriceProps): React.ReactElement;

export interface Swatch { color: string; name: string }
export interface ProductCardProps {
  name: string;
  href?: string;
  price: number;
  originalPrice?: number;
  /** 4:5 portrait image. */
  imageSrc?: string;
  /** "[Color] [style] bag, [key detail]" */
  imageAlt?: string;
  /** At most two are shown. */
  badges?: { tone: BadgeProps['tone']; label?: string }[];
  /** Up to four shown, then "+N". */
  swatches?: Swatch[];
  soldOut?: boolean;
  wishlisted?: boolean;
  onToggleWishlist?: () => void;
  lang?: string;
}
export declare function ProductCard(props: ProductCardProps): React.ReactElement;

export interface FilterChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> { selected?: boolean }
export declare function FilterChip(props: FilterChipProps): React.ReactElement;
export interface FilterChipRowProps { label?: string; children?: React.ReactNode }
export declare function FilterChipRow(props: FilterChipRowProps): React.ReactElement;

export interface QuantityStepperProps { value: number; min?: number; max?: number; onChange?: (value: number) => void; label?: string }
export declare function QuantityStepper(props: QuantityStepperProps): React.ReactElement;

export interface CartLineProps {
  name: string;
  imageSrc?: string;
  imageAlt?: string;
  color?: string;
  size?: string;
  quantity: number;
  max?: number;
  unitPrice: number;
  onQuantityChange?: (value: number) => void;
  onRemove?: () => void;
  removeLabel?: string;
}
export declare function CartLine(props: CartLineProps): React.ReactElement;

export interface OrderSummaryProps {
  subtotal: number;
  /** Delivery fee in taka; 0 shows deliveryLabel ("Free"). Always shown before checkout. */
  delivery?: number;
  deliveryLabel?: string;
  itemCount?: number;
  /** Stick to the bottom of the viewport (mobile checkout). */
  sticky?: boolean;
  /** Show the Cash on Delivery note. Default true. */
  showPayment?: boolean;
  labels?: Partial<{ subtotal: string; delivery: string; total: string; cod: string; codNote: string }>;
  /** Slot for the primary action, e.g. <Button fullWidth>Place order · ৳ 1,450</Button>. */
  children?: React.ReactNode;
  lang?: string;
}
export declare function OrderSummary(props: OrderSummaryProps): React.ReactElement;

export interface TextFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label: string;
  hint?: string;
  /** Short fix, e.g. "Enter 11 digits, starting 01". */
  error?: string;
  optional?: boolean;
  /** Renders a <select>. */
  options?: (string | { value: string; label: string })[];
  multiline?: boolean;
}
export declare function TextField(props: TextFieldProps): React.ReactElement;

export interface TrustStripProps { items?: { icon: IconName; label: string }[]; lang?: string }
export declare function TrustStrip(props: TrustStripProps): React.ReactElement;

export interface HeaderProps {
  /** The burgundy wordmark: assets/Logos/bagvaly-wordmark-burgundy.svg */
  logoSrc: string;
  homeHref?: string;
  cartCount?: number;
  /** Adds shadow-sm once the page has scrolled. */
  scrolled?: boolean;
  showAccount?: boolean;
  onSearch?: () => void;
  onCart?: () => void;
  onAccount?: () => void;
}
export declare function Header(props: HeaderProps): React.ReactElement;

export interface FooterProps {
  /** The ivory wordmark: assets/Logos/bagvaly-wordmark-ivory.svg */
  logoSrc: string;
  homeHref?: string;
  columns?: { title: string; links: { label: string; href?: string }[] }[];
  bottomLine?: string;
}
export declare function Footer(props: FooterProps): React.ReactElement;

export interface ToastProps { tone?: 'success' | 'error'; children: React.ReactNode; onDismiss?: () => void; lang?: string }
export declare function Toast(props: ToastProps): React.ReactElement;

export interface IconProps { name: IconName; size?: number; label?: string; className?: string }
export declare function Icon(props: IconProps): React.ReactElement;

export declare function formatPrice(amount: number): string;

declare global {
  interface Window {
    Bagvaly: {
      Button: typeof Button; Badge: typeof Badge; Price: typeof Price; ProductCard: typeof ProductCard;
      FilterChip: typeof FilterChip; FilterChipRow: typeof FilterChipRow; QuantityStepper: typeof QuantityStepper;
      CartLine: typeof CartLine; OrderSummary: typeof OrderSummary; TextField: typeof TextField; TrustStrip: typeof TrustStrip;
      Header: typeof Header; Footer: typeof Footer; Toast: typeof Toast; Icon: typeof Icon; formatPrice: typeof formatPrice;
    }
  }
}
