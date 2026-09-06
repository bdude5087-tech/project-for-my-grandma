import type { Metadata } from "next";
import Link from "next/link";
import HowWeRank from "@/components/HowWeRank";
import JsonLd from "@/components/JsonLd";
import { getMeta, getScoring } from "@/lib/data";
import { formatLongDate } from "@/lib/format";
import { breadcrumbJsonLd } from "@/lib/json-ld";

export const metadata: Metadata = {
  title: "How we rank eSIM plans",
  description:
    "Our scoring methodology in full: data source, normalization rules, weights, and how value scores are computed. Transparent and deterministic.",
  alternates: { canonical: "/how-we-rank/" },
  openGraph: {
    type: "website",
    url: "/how-we-rank/",
    title: "How we rank eSIM plans",
    description:
      "Transparent scoring: data source, normalization rules, and weights for every eSIM plan we review.",
  },
};

export default function HowWeRankPage() {
  const scoring = getScoring();
  const meta = getMeta();

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12 sm:px-6">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "How we rank", path: "/how-we-rank/" },
        ])}
      />

      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
        How we rank eSIM plans
      </h1>

      <p className="mt-6 text-lg leading-relaxed text-gray-700">
        Every plan on this site is scored with the same formula. The weights
        below are applied to normalized values within each destination, so a
        plan is always compared against the cheapest price-per-GB, the largest
        data allowance, and the longest validity available for that country at
        that time. Nothing is scored subjectively, and the weights are checked
        into our repository where anyone can read them.
      </p>

      <div className="mt-8">
        <HowWeRank />
      </div>

      <h2 className="mt-12 text-2xl font-semibold tracking-tight">
        Normalization rules
      </h2>
      <div className="mt-4 space-y-4 leading-relaxed text-gray-700">
        <p>
          Scoring works on normalized inputs so that different units can be
          compared fairly:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>Price per GB</strong> — bounded at ${(scoring.normalization as { price_per_gb_cap?: number }).price_per_gb_cap ?? 50}
            , so an unlimited plan is treated as a large-but-finite allowance
            rather than an infinite one.
          </li>
          <li>
            <strong>Unlimited plans</strong> — valued as{" "}
            {(scoring.normalization as { unlimited_nominal_data_gb?: number }).unlimited_nominal_data_gb ?? 1000}{" "}
            GB for scoring purposes.
          </li>
          <li>
            <strong>Validity</strong> — capped at{" "}
            {(scoring.normalization as { validity_cap_days?: number }).validity_cap_days ?? 90}{" "}
            days; plans valid up to the cap score the same.
          </li>
          <li>
            <strong>Network generation</strong> — 5G-capable plans score higher
            than 4G-only plans (minimum supported generation is{" "}
            {(scoring.normalization as { min_network_generation?: string }).min_network_generation ?? "4G"}
            ).
          </li>
          <li>
            <strong>Data limit</strong> — entries with no usable data allowance
            are dropped during validation rather than scored.
          </li>
        </ul>
        <p>
          Weights sum to 100%. The price factor asks &ldquo;is this a good deal
          per GB, for this destination&rdquo;, the data and validity factors
          ask &ldquo;does it cover a reasonable trip&rdquo;, and the network,
          hotspot, and reliability factors decide ties between plans that are
          otherwise similar.
        </p>
      </div>

      <h2 className="mt-12 text-2xl font-semibold tracking-tight">
        How the plan finder picks suggestions
      </h2>
      <div className="mt-4 space-y-4 leading-relaxed text-gray-700">
        <p>
          The homepage finder asks four questions — destination, data per day,
          trip length, and an optional budget — and filters the exact same
          scored dataset described above. Its matching rule is fixed and
          published here:
        </p>
        <ol className="list-decimal space-y-2 pl-5">
          <li>
            <strong>Full fit</strong> — validity covers the trip, data covers
            the need (or the plan is unlimited), and price fits the budget.
          </li>
          <li>
            <strong>No budget match</strong> — same as above minus the budget
            constraint.
          </li>
          <li>
            <strong>Data relaxed</strong> — validity and budget match, but the
            plan may need a top-up.
          </li>
          <li>
            <strong>Closest picks</strong> — nothing fits; we show the
            destination&rsquo;s highest-value plans anyway.
          </li>
        </ol>
        <p>
          Within a tier, suggestions are ordered by value score (highest first),
          then by price. Unlimited daily data means only truly unlimited plans
          are suggested. The finder never changes a score and never introduces
          new ranking logic — it only filters and comments on the published
          ranking.
        </p>
      </div>

      <h2 className="mt-12 text-2xl font-semibold tracking-tight">
        Data source and freshness
      </h2>
      <p className="mt-4 leading-relaxed text-gray-700">
        Plans come from the public MeiSIM catalog ({meta.source}), fetched for
        each destination on a schedule. Records are normalized and validated,
        then a value score and the cheapest/best-value/median price-per-GB
        stats are computed per destination and stored in commit-friendly JSON.
        This page and all comparison content rebuild from that data. The
        current dataset was last updated{" "}
        {formatLongDate(meta.last_updated)}.
      </p>

      <h2 className="mt-12 text-2xl font-semibold tracking-tight">
        What the score does not include
      </h2>
      <ul className="mt-4 list-disc space-y-2 pl-5 leading-relaxed text-gray-700">
        <li>
          <strong>Provider reliability</strong> — we start every provider at a
          neutral baseline until we have enough independent user data to
          override it. We never take a provider&rsquo;s marketing claim at face
          value.
        </li>
        <li>
          <strong>Local network quality</strong> — coverage and speeds inside a
          country vary by carrier partner; we rank the plan, not every square
          meter of the country.
        </li>
        <li>
          <strong>Seasonal deals</strong> — catalogs change; scores are a
          point-in-time snapshot refreshed every 12 hours.
        </li>
      </ul>

      <h2 className="mt-12 text-2xl font-semibold tracking-tight">
        Outbound-link policy
      </h2>
      <div className="mt-4 space-y-4 leading-relaxed text-gray-700">
        <p>
          We add two kinds of outbound links: citations and purchases.
          Citation links point to the public catalog entry a plan came from,
          so readers can verify our reading of the data. Purchase links go to
          provider pages, sometimes through an affiliate program. Both are
          clearly distinguishable, and neither is sold or gated by budget.
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>Citation links</strong> — every plan cites its source
            catalog; we don&rsquo;t link to paywalled or non-browsable sources.
          </li>
          <li>
            <strong>Purchase links with an affiliate tag</strong> — marked and
            covered by the{" "}
            <Link href="/affiliate-disclosure/" className="text-emerald-700 hover:underline">
              affiliate disclosure
            </Link>
            . They may set third-party cookies from the vendor.
          </li>
          <li>
            <strong>No link selling</strong> — nobody can buy a link in, a
            citation, or a removal.
          </li>
          <li>
            <strong>No links to renew</strong> — outbound pages use permanent,
            relative or source-verifiable URLs; there is no paid link renewal
            cycle.
          </li>
        </ul>
      </div>
    </main>
  );
}