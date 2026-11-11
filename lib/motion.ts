/**
 * The lift on a card that links (micro motion, David, Nov 11): its shadow warms as before and, where
 * motion is welcome, it rises 2px under a pointer and settles back as it is pressed. Tailwind's
 * `hover:` applies only on a device that can hover, so a tap never leaves a card stuck up. A card
 * that does not link never lifts (`Card`).
 */
export const LIFT =
  'transition-[box-shadow,translate] duration-200 hover:shadow-warm motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-0';
