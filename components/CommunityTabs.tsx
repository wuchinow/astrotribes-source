import Link from 'next/link';
import { communityCopy } from '@/content/council';
import { cn } from '@/lib/cn';

const TABS = [
  { href: '/members/council', key: 'council' },
  { href: '/members', key: 'members' },
  { href: '/members/messages', key: 'messages' },
] as const;

/**
 * The row of three at the top of the Council's pages (5b, Nov 11; agreed with the Your chart thread):
 * Council, Members, Messages. The main nav has one Council item for members (David, Nov 11: "council");
 * these move between its three pages. Links, not a tab widget: each is its own page.
 */
export function CommunityTabs({ current }: { current: (typeof TABS)[number]['key'] }) {
  return (
    <nav aria-label={communityCopy.label} className="mb-6 border-b border-ink-200">
      <ul role="list" className="-mb-px flex flex-wrap gap-x-6">
        {TABS.map((tab) => (
          <li key={tab.key}>
            <Link
              href={tab.href}
              aria-current={tab.key === current ? 'page' : undefined}
              className={cn(
                'inline-flex min-h-touch items-center border-b-2 type-ui font-semibold',
                tab.key === current
                  ? 'border-cobalt-600 text-ink-900'
                  : 'border-transparent text-cobalt-600 hover:border-gold-500',
              )}
            >
              {communityCopy.tabs[tab.key]}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
