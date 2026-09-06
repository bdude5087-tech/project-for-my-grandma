import type { Metadata } from "next";
import Link from "next/link";
import PlanFinder from "@/components/PlanFinder";
import {
  getDestinationsConfig,
  getMeta,
  getProcessedDestinations,
  getProviders,
  getSearchIndex,
} from "@/lib/data";
import { formatLongDate, formatMoney } from "@/lib/format";

export const metadata: Metadata = {
  title: "Find the Best eSIM Plan for Your Trip",
  description:
    "Enter your destination, data needs, and trip length to find the best eSIM plan instantly. Cheapest plans, best-value picks, and real price-per-GB comparisons — updated every 12 hours.",
};

export default function Home() {
  const index = getSearchIndex();
  const dests = getDestinationsConfig();
  const processed = getProcessedDestinations();
  const byCode = new Map(processed.map((d) => [d.country_code, d]));
  const meta = getMeta();
  const providerCount = getProviders().length;

  const popular = dests.slice(0, 6);

  return (
    <main className="flex-1">
      <section className="bg-gradient-to-b from-emerald-50 via-white to-white">
        <div className="mx-auto w-full max-w-5xl px-4 pb-14 pt-12 sm:px-6 sm:pb-20 sm:pt-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-700">
            No sign-up · No AI · Free
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Find your perfect eSIM plan for any trip
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-gray-600">
            Tell us where you&rsquo;re going, how much data you need, and how
            long you&rsquo;ll be there. We&rsquo;ll match you against{" "}
            {meta.plan_count} plans from {providerCount} providers — ranked by a
            transparent, published formula, never by opinion.
          </p>

          <div className="mt-8">
            <PlanFinder destinations={index.destinations} />
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-gray-500">
            <span>
              {meta.plan_count} live plans across {providerCount} providers
            </span>
            <span aria-hidden>·</span>
            <span>Updated every 12 hours</span>
            <span aria-hidden>·</span>
            <span>Last verified {formatLongDate(meta.last_updated)}</span>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-xl font-semibold text-gray-900">
            Popular destinations
          </h2>
          <Link
            href="/all-locations/"
            className="text-sm font-semibold text-emerald-700 hover:underline"
          >
            All destinations &rarr;
          </Link>
        </div>
        <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {popular.map((dest) => {
            const p = byCode.get(dest.code);
            return (
              <li key={dest.code}>
                <Link
                  href={`/esim/${dest.slug}/`}
                  className="block h-full rounded-xl border border-gray-200 p-4 transition hover:border-emerald-400 hover:shadow-sm"
                >
                  <span className="font-semibold text-gray-900">
                    {dest.name}
                  </span>
                  {p && (
                    <span className="mt-1 block text-xs text-gray-500">
                      {p.plan_count} plans
                      {p.cheapest_price
                        ? ` · from ${formatMoney(p.cheapest_price)}`
                        : ""}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mx-auto w-full max-w-5xl px-4 pb-12 sm:px-6">
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="rounded-xl border border-gray-200 bg-emerald-50/50 p-6">
            <h2 className="text-lg font-semibold text-gray-900">
              How we find the best plan
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              We normalize every plan from the public MeiSIM catalog and score
              it with a published, deterministic formula — cheapest price per
              GB first, then data, validity, network, hotspot, and reliability.
              No AI writes or ranks anything.
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
              Providers can&rsquo;t pay for placement — ever. Purchase links
              may earn us a commission, but a score is a score. Learn who we are
              and what we publish.
            </p>
            <Link
              href="/about/"
              className="mt-3 inline-block text-sm font-medium text-emerald-700 hover:underline"
            >
              About RoamRank &rarr;
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}