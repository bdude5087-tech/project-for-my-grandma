import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Byline from "@/components/Byline";
import JsonLd from "@/components/JsonLd";
import PurchaseButton from "@/components/PurchaseButton";
import { getComparePairs, getMeta, getProviders, providerBySlug, slugifyProvider } from "@/lib/data";
import { formatMoney } from "@/lib/format";
import { breadcrumbJsonLd } from "@/lib/json-ld";
import { buildProviderStats, verdict } from "@/lib/provider-stats";
import { SITE_NAME } from "@/lib/site";

type PageProps = { params: Promise<{ pair: string }> };

export function generateStaticParams() {
  const present = new Set(
    getProviders().map((p) => slugifyProvider(p.name)),
  );
  return getComparePairs()
    .filter(
      ([a, b]) =>
        present.has(slugifyProvider(a)) && present.has(slugifyProvider(b)),
    )
    .map(([a, b]) => ({ pair: `${slugifyProvider(a)}-vs-${slugifyProvider(b)}` }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { pair } = await params;
  const parts = pair.split("-vs-");
  if (parts.length !== 2) return {};
  const [a, b] = parts;
  const title = `${a} vs ${b}: Which eSIM Is Better?`;
  const description = `Compare ${a} vs ${b} eSIM plans: prices, data allowances, coverage, validity, and a data-driven verdict. Updated every 12 hours.`;
  const path = `/compare/${pair}/`;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      url: path,
      title,
      description,
      siteName: SITE_NAME,
      images: [{ url: "/og.png", width: 1200, height: 630, alt: SITE_NAME }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og.png"],
    },
  };
}

export default async function ComparePage({ params }: PageProps) {
  const { pair } = await params;
  const parts = pair.split("-vs-");
  if (parts.length !== 2) notFound();

  const find = (slug: string) => providerBySlug(slug);

  const providerA = find(parts[0]);
  const providerB = find(parts[1]);
  if (!providerA || !providerB) notFound();

  const statsA = buildProviderStats(providerA.name);
  const statsB = buildProviderStats(providerB.name);
  const result = verdict(statsA, statsB);
  const lastUpdated = getMeta().last_updated;

  const rows: { label: string; a: string; b: string; winner?: "a" | "b" | "tie" }[] = [
    { label: "Total plans", a: String(statsA.plan_count), b: String(statsB.plan_count) },
    { label: "Destinations covered", a: String(statsA.destination_codes.length), b: String(statsB.destination_codes.length) },
    { label: "Price range", a: `${formatMoney(statsA.price_min)}–${formatMoney(statsA.price_max)}`, b: `${formatMoney(statsB.price_min)}–${formatMoney(statsB.price_max)}` },
    { label: "Median price per GB", a: statsA.median_price_per_gb?.toFixed(2) ?? "—", b: statsB.median_price_per_gb?.toFixed(2) ?? "—" },
    { label: "5G plan share", a: `${Math.round(statsA.five_g_share * 100)}%`, b: `${Math.round(statsB.five_g_share * 100)}%` },
    { label: "Unlimited plans", a: String(statsA.unlimited_count), b: String(statsB.unlimited_count) },
  ];

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          {
            name: `${providerA.name} vs ${providerB.name}`,
            path: `/compare/${pair}/`,
          },
        ])}
      />

      <p className="text-sm text-gray-500">
        <Link href="/" className="hover:text-gray-700">
          Home
        </Link>{" "}
        &rsaquo;{" "}
        <span className="text-gray-700">
          {providerA.name} vs {providerB.name}
        </span>
      </p>

      <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
        {providerA.name} vs {providerB.name}: Which eSIM Is Better?
      </h1>

      <Byline lastUpdated={lastUpdated} />

      <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-5">
        <p className="text-base leading-relaxed text-gray-800 sm:text-lg">
          <strong>{result.leading.name}</strong> wins our comparison:{" "}
          {result.summary} Verdict is computed from the live plan dataset below
          and is not influenced by sponsors.
        </p>
        <div className="mt-3 flex flex-wrap gap-3">
          <PurchaseButton providerName={providerA.name} size="md" />
          <PurchaseButton providerName={providerB.name} size="md" />
        </div>
      </div>

      <div className="mt-10 overflow-x-auto rounded-xl border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-4 py-3 font-semibold text-gray-900">Attribute</th>
              <th scope="col" className="px-4 py-3 font-semibold text-gray-900">{providerA.name}</th>
              <th scope="col" className="px-4 py-3 font-semibold text-gray-900">{providerB.name}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {rows.map((row) => (
              <tr key={row.label}>
                <td className="px-4 py-3 font-medium text-gray-900">{row.label}</td>
                <td className="px-4 py-3 text-gray-700">{row.a}</td>
                <td className="px-4 py-3 text-gray-700">{row.b}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <section aria-labelledby="choose-heading" className="mt-10 grid gap-6 sm:grid-cols-2">
        <div className="rounded-xl border border-gray-200 p-5">
          <h2 id="choose-heading" className="text-lg font-semibold text-gray-900">
            Choose {providerA.name} if you want…
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-gray-700">
            {statsA.plan_count >= statsB.plan_count && <li>the widest selection of plans</li>}
            {(statsA.median_price_per_gb ?? 0) <= (statsB.median_price_per_gb ?? 0) && <li>a lower typical price per GB</li>}
            {statsA.five_g_share >= statsB.five_g_share && <li>more 5G network options</li>}
            {statsA.destination_codes.length >= statsB.destination_codes.length && <li>broader destination coverage</li>}
            {statsA.unlimited_count > 0 && <li>unlimited data options</li>}
          </ul>
        </div>
        <div className="rounded-xl border border-gray-200 p-5">
          <h2 className="text-lg font-semibold text-gray-900">
            Choose {providerB.name} if you want…
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-gray-700">
            {statsB.plan_count >= statsA.plan_count && <li>the widest selection of plans</li>}
            {(statsB.median_price_per_gb ?? 0) <= (statsA.median_price_per_gb ?? 0) && <li>a lower typical price per GB</li>}
            {statsB.five_g_share >= statsA.five_g_share && <li>more 5G network options</li>}
            {statsB.destination_codes.length >= statsA.destination_codes.length && <li>broader destination coverage</li>}
            {statsB.unlimited_count > 0 && <li>unlimited data options</li>}
          </ul>
        </div>
      </section>

      <p className="mt-10 text-xs text-gray-500">
        Data source: MeiSIM public catalog. Last updated {lastUpdated}. Prices are in USD.
      </p>
    </main>
  );
}