import Link from 'next/link';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'secondary' | 'tertiary' | 'danger';
type Size = 'sm' | 'md' | 'lg' | 'nav';

interface CommonProps {
  variant?: Variant;
  size?: Size;
  /** Optional leading Lucide icon, 20px at 1.5px stroke. */
  icon?: ReactNode;
  className?: string;
  children: ReactNode;
}

type NativeProps = Omit<ComponentPropsWithoutRef<'button'>, keyof CommonProps>;

/** Pass `href` when the button navigates; it renders a link. */
export type ButtonProps = CommonProps & ({ href: string } | ({ href?: undefined } & NativeProps));

const base =
  'inline-flex items-center justify-center gap-2 rounded-sm border-[1.5px] font-body font-semibold leading-[1.25] no-underline transition-[background-color,color,border-color,outline-color] duration-200 disabled:cursor-not-allowed disabled:opacity-45 aria-disabled:cursor-not-allowed aria-disabled:opacity-45';

// Primary (design system v19): the logo's deep plum on Paper with plum-700 on hover; pale cobalt on
// Night with a cobalt-400 hover (its dark on-cobalt text holds 6.6:1). Primary buttons only: links,
// outline buttons, chips, and every other control stay cobalt. The focus ring keeps its 2px offset
// and paper halo.
const variants: Record<Variant, string> = {
  primary:
    'border-transparent bg-button-primary text-on-button-primary hover:bg-button-primary-hover',
  secondary: 'bg-transparent text-ink-900 border-ink-900 hover:bg-surface-200',
  tertiary:
    'border-transparent bg-transparent text-cobalt-600 px-2 hover:underline hover:decoration-gold-500 hover:decoration-2 hover:underline-offset-4',
  // An action that cannot be undone (2b: Delete my account). Ember, the colour errors already take.
  danger: 'bg-transparent text-ember-500 border-ember-500 hover:bg-surface-200',
};

// Small buttons are 36px tall; the ::before extends the hit area to 44px.
const sizes: Record<Size, string> = {
  sm: 'relative min-h-9 px-4 text-[0.875rem] before:absolute before:inset-x-0 before:-inset-y-1',
  md: 'min-h-touch px-6 text-[1rem]',
  lg: 'min-h-[52px] px-8 text-[1.125rem]',
  // The header's primary action (1h): full height, one line, tighter on a phone so it fits beside
  // the logo and the menu button at 360px.
  nav: 'min-h-touch whitespace-nowrap px-3 text-[1rem] md:px-6',
};

export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  className,
  children,
  ...rest
}: ButtonProps) {
  const classes = cn(
    base,
    variants[variant],
    sizes[size],
    variant === 'tertiary' && 'min-h-touch',
    className,
  );

  if (rest.href !== undefined) {
    return (
      <Link href={rest.href} className={classes}>
        {icon}
        {children}
      </Link>
    );
  }

  const { href: _href, type = 'button', ...buttonProps } = rest;
  void _href;
  return (
    <button type={type} className={classes} {...buttonProps}>
      {icon}
      {children}
    </button>
  );
}
