/**
 * A pointing hand in the manner of 19th-century printers' manicules, drawn for us (4d) for Dawa's
 * "Find your Keys" (Nov 7): "those old 19th century pointing hands graphics ... a dismembered floating
 * hand that is pointing". Ink in the current text color; `left` turns it to point the other way.
 * The finger is a third shorter than first drawn, the hand itself unchanged (4u, David, Nov 9: "finger in hand
 * pointing to keys looks a bit long"); the landing page narrowed its widths to match, so the hand keeps its size.
 */
export function PointingHand({ direction = 'right', className }: { direction?: 'left' | 'right'; className?: string }) {
  return (
    <svg
      viewBox="0 0 132 64"
      aria-hidden="true"
      className={className}
      style={direction === 'left' ? { transform: 'scaleX(-1)' } : undefined}
    >
      <g fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 14 L22 12 L24 52 L8 50 Z" fill="currentColor" />
        <path d="M22 12 L30 12.5 L31 51.5 L24 52" />
        <path d="M26 16 L26.6 48" strokeWidth="1.4" />
        <path d="M30 13 C40 10 50 9 60 12 C66 14 70 16 76 16 L122 16 C128 16 130 24 124 25 L86 25" />
        <path d="M60 12 C64 18 72 22 84 22 C88 22 88 26 84 26" />
        <path d="M86 25 C93 25 95 33 88 34 L76 34" />
        <path d="M80 34 C87 34 88 42 81 43 L72 43" />
        <path d="M75 43 C81 44 81 51 74 51.5 L60 52 C48 52.5 38 52 31 51.5" />
        <path d="M40 20 L46 44" strokeWidth="1.2" />
        <path d="M46 19 L52 45" strokeWidth="1.2" />
        <path d="M52 19 L58 46" strokeWidth="1.2" />
        <path d="M116 18 C119 18 121 20 121 21" strokeWidth="1.4" />
      </g>
    </svg>
  );
}
