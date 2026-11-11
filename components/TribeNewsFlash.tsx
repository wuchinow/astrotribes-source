import Link from "next/link";
import { LocalWhen } from "@/components/sky/LocalWhen";
import { tribePage as copy } from "@/content/tribes";
import { BODIES, SIGNS, type SignId } from "@/lib/keys";
import type { TribeNews } from "@/lib/tribe-news";

const nameOf = (id: keyof typeof BODIES) => BODIES[id].name;

/** "Nov 12", from a UTC calendar date. */
const day = (date: string) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T12:00:00Z`));

/**
 * The Tribe page's News Flash (4f): the ruling planet tracker and this week in the sign, from Today's
 * sky (lib/tribe-news.ts), until Dawa's monthly news arrives. Times show in the visitor's own zone.
 */
export function TribeNewsFlash({
  sign,
  news,
}: {
  sign: SignId;
  news: TribeNews;
}) {
  const name = SIGNS[sign].name;
  // The line above this one already says where the ruling planet is, so when it is at home in its own
  // sign it is left out of who is here ("Your ruling planet, Venus, is in Libra." then "Venus is in
  // Libra now." said it twice).
  const rulerHome = news.ruler.sign === sign;
  const visiting = news.visiting.filter((body) => !(rulerHome && body === news.ruler.body)).map(nameOf);
  return (
    <aside
      aria-labelledby="news-title"
      className="self-start rounded-md border border-ink-200 bg-surface-200 p-6 shadow-rest"
    >
      <p className="type-label text-ink-500">{copy.news.eyebrow}</p>
      <h2
        id="news-title"
        className="mt-1 type-heading-3 font-normal text-ink-900"
      >
        {copy.news.title(name)}
      </h2>
      <ul role="list" className="mt-4 grid gap-3 type-body-sm text-ink-700">
        <li>
          {copy.news.ruler(
            nameOf(news.ruler.body),
            SIGNS[news.ruler.sign].name,
            news.ruler.retrograde,
          )}
        </li>
        {visiting.length > 0 ? (
          <li>{copy.news.visiting(visiting, name)}</li>
        ) : rulerHome ? null : (
          <li>{copy.news.nobody(name)}</li>
        )}
        {news.moonVisit ? (
          <li>
            {copy.news.moonVisit(name)} {day(news.moonVisit)}.
          </li>
        ) : null}
        {news.lunations.map((l) => (
          <li key={l.at}>
            {copy.news.lunation[l.kind](name)} <LocalWhen at={l.at} />
          </li>
        ))}
        {news.changes.map((c) => {
          const body = nameOf(c.body);
          const text =
            c.kind === "ingress"
              ? c.to === sign
                ? copy.news.ingress(body, name)
                : copy.news.leaves(body, SIGNS[c.to].name)
              : c.turns === "retrograde"
                ? copy.news.retrograde(body, name)
                : copy.news.direct(body, name);
          return (
            <li key={`${c.kind}-${c.body}-${c.at}`}>
              {text}: <LocalWhen at={c.at} />
            </li>
          );
        })}
      </ul>
      <Link
        href={copy.news.more.href}
        className="mt-5 inline-flex min-h-touch items-center gap-2 type-ui text-cobalt-600 underline-offset-4 hover:underline"
      >
        {copy.news.more.label}
        <span aria-hidden="true">{"→"}</span>
      </Link>
    </aside>
  );
}
