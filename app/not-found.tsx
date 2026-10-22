import Link from 'next/link';
import { Logo } from '@/components/Logo';

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-content flex-col items-start justify-center gap-6 px-4 md:px-6">
      <Link href="/" className="inline-flex min-h-touch items-center">
        <Logo className="w-[200px]" />
      </Link>
      <h1 className="type-heading-1 text-ink-900">This page is not here</h1>
      <p className="max-w-measure">The link may be old, or the page has not been built yet.</p>
      <Link
        href="/"
        className="inline-flex min-h-touch items-center text-cobalt-600 underline underline-offset-4"
      >
        Go to the home page
      </Link>
    </main>
  );
}
