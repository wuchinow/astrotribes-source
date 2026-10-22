/**
 * The name of an icon-only control, shown above it on hover and on keyboard focus (the footer, 1h).
 * The button already carries the name, so this is aria-hidden. Put it after the button, inside a
 * `group/tip` wrapper.
 */
export function IconTip({ children }: { children: string }) {
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-1 -translate-x-1/2 rounded-sm bg-ink-900 px-2 py-1 font-body text-[0.875rem] leading-tight whitespace-nowrap text-surface-000 opacity-0 transition-opacity duration-200 group-hover/tip:opacity-100 group-has-[:focus-visible]/tip:opacity-100 motion-reduce:transition-none"
    >
      {children}
    </span>
  );
}
