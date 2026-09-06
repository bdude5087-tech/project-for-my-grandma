import type { Metadata } from "next";
import Link from "next/link";
import {
  getAggregates,
  getDestinationsConfig,
  getMeta,
} from "@/lib/data";
import { formatLongDate, formatMoney } from "@/lib/format";

export const metadata: Metadata = {
  title: "All eSIM Destinations",
  description:
    "Browse eSIM plan comparisons for every destination we cover — cheapest plans, best-value picks, price per GB, and coverage, verified every 12 hours.",
  alternates: { canonical: "/all-locations/" },
};

export default function AllLocationsPage() {
  const dests = getDestinationsConfig();
  const aggregates = getAggregates();
  const meta = getMeta();

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        All eSIM destinations
      </h1>
      <p className="mt-3 max-w-2xl text-lg text-gray-600">
        Live plan comparisons for every country we track. Choose a destination
        to see the cheapest plan, the best-value pick, real price-per-GB data,
        and the full filterable plan table.
      </p>

      <ul className="mt-8 grid gap-4 sm:grid-cols-2">
        {dests.map((dest) => {
          const agg = aggregates[dest.code];
          return (
            <li key={dest.code}>
              <Link
                href={`/esim/${dest.slug}/`}
                className="block h-full rounded-xl border border-gray-200 p-5 transition hover:border-emerald-400 hover:shadow-sm"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {dest.name}
                  </h2>
                  {agg?.cheapest_plan && (
                    <span className="text-lg font-bold text-emerald-700">
                      from {formatMoney(agg.cheapest_plan.price)}
                    </span>
                  )}
                </div>
                {agg && (
                  <dl className="mt-3 grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <dt className="text-xs text-gray-500">Plans</dt>
                      <dd className="mt-0.5 font-medium text-gray-900">
                        {agg.plan_count}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-gray-500">Providers</dt>
                      <dd className="mt-0.5 font-medium text-gray-900">
                        {agg.provider_count}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-gray-500">Median price/GB</dt>
                      <dd className="mt-0.5 font-medium text-gray-900">
                        {agg.median_price_per_gb
                          ? formatMoney(agg.median_price_per_gb) + "/GB"
                          : "—"}
                      </dd>
                    </div>
                  </dl>
                )}
                <span className="mt-4 inline-block text-sm font-medium text-emerald-700">
                  View comparison &rarr;
                </span>
              </Link>
            </li>
          );
        })}
      </ul>

      <p className="mt-8 text-xs text-gray-500">
        We currently cover {dests.length} destinations — more are added as we
        validate coverage. Prices are in USD and last verified{" "}
        {formatLongDate(meta.last_updated)}.
      </p>
    </main>
  );
}