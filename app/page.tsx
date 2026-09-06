import Link from "next/link";
import {
  getDestinationsConfig,
  getMeta,
  getProcessedDestinations,
} from "@/lib/data";
import { formatLongDate } from "@/lib/format";

export default function Home() {
  const dests = getDestinationsConfig();
  const processed = getProcessedDestinations();
  const byCode = new Map(processed.map((d) => [d.country_code, d]));
  const meta = getMeta();

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        Compare eSIM plans, prices, and coverage by country
      </h1>
      <p className="mt-3 max-w-2xl text-lg text-gray-600">
        We compare live eSIM pricing from public catalogs so you can see the
        cheapest plan, the best-value plan, and real price-per-GB data for each
        destination. Data refreshed every 12 hours.
      </p>

      <section className="mt-10">
        <h2 className="text-xl font-semibold">Top destinations</h2>
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {dests.map((dest) => {
            const p = byCode.get(dest.code);
            return (
              <li key={dest.code}>
                <Link
                  href={`/esim/${dest.slug}`}
                  className="block rounded-lg border border-gray-200 p-4 transition hover:border-gray-400"
                >
                  <span className="font-medium text-gray-900">{dest.name}</span>
                  {p && (
                    <span className="mt-1 block text-xs text-gray-500">
                      {p.plan_count} plans · from ${p.cheapest_price ?? "—"}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mt-12 grid gap-6 sm:grid-cols-2">
        <div className="rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900">
            How we find the best plan
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-600">
            We normalize every plan from the public MeiSIM catalog and score it
            with a published, deterministic formula — cheapest price per GB
            first, then data, validity, network, hotspot, and reliability. No
            AI writes or ranks anything.
          </p>
          <Link
            href="/how-we-rank/"
            className="mt-3 inline-block text-sm font-medium text-emerald-700 hover:underline"
          >
            Read the full methodology &rarr;
          </Link>
        </div>
        <div className="rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Independent and reader-supported
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-600">
            Providers can&rsquo;t pay for placement — ever. Purchase links may
            earn us a commission, but a score is a score. Learn who we are and
            what we publish.
          </p>
          <Link
            href="/about/"
            className="mt-3 inline-block text-sm font-medium text-emerald-700 hover:underline"
          >
            About eSIM Compare &rarr;
          </Link>
        </div>
      </section>

      <footer className="mt-12 border-t border-gray-200 pt-6 text-xs text-gray-500">
        <p>
          Data source: MeiSIM public catalog. Plans last verified{" "}
          {formatLongDate(meta.last_updated)} and prices are in USD.
        </p>
      </footer>
    </main>
  );
}