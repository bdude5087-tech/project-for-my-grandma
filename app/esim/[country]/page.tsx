import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import AnswerBox from "@/components/AnswerBox";
import Byline from "@/components/Byline";
import FaqSection from "@/components/FaqSection";
import FilterablePlanTable from "@/components/FilterablePlanTable";
import HowWeRank from "@/components/HowWeRank";
import JsonLd from "@/components/JsonLd";
import RelatedDestinations from "@/components/RelatedDestinations";
import {
  getAggregates,
  getDestBySlug,
  getDestinationsConfig,
  getFaqs,
  getPlansForCountry,
} from "@/lib/data";
import { buildPurchaseLink } from "@/lib/affiliate";
import { formatLongDate, formatMonthYear } from "@/lib/format";
import {
  breadcrumbJsonLd,
  faqPageJsonLd,
  planItemListJsonLd,
} from "@/lib/json-ld";
import { SITE_NAME } from "@/lib/site";

type PageProps = { params: Promise<{ country: string }> };

export function generateStaticParams() {
  return getDestinationsConfig().map((d) => ({ country: d.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { country } = await params;
  const dest = getDestBySlug(country);
  if (!dest) return {};
  const title = `Best eSIM for ${dest.name} — Compare Plans & Prices`;
  const description = `Compare ${dest.name} eSIM plans and prices. Cheapest plan, best value, price per GB, coverage, and requirements — verified and updated every 12 hours.`;
  const path = `/esim/${dest.slug}/`;
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
      images: [
        { url: "/og.png", width: 1200, height: 630, alt: SITE_NAME },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og.png"],
    },
  };
}

export default async function DestinationPage({ params }: PageProps) {
  const { country } = await params;
  const dest = getDestBySlug(country);
  if (!dest) notFound();

  const aggregates = getAggregates();
  const agg = aggregates[dest.code];
  if (!agg) notFound();

  const plans = getPlansForCountry(dest.code).map((p) => ({
    plan_name: p.plan_name,
    provider: p.provider,
    price: p.price,
    currency: p.currency,
    data_gb: p.data_gb,
    price_per_gb: p.price_per_gb,
    unlimited: p.unlimited,
    validity_days: p.validity_days,
    network: p.network,
    hotspot: p.hotspot,
    purchase: buildPurchaseLink(p.provider),
  }));

  const faqs = getFaqs();

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: dest.name, path: `/esim/${dest.slug}/` },
        ])}
      />
      <JsonLd data={faqPageJsonLd(faqs, dest.name, agg)} />
      <JsonLd data={planItemListJsonLd(agg.ranked_plans, dest.name, dest.slug)} />

      <p className="text-sm text-gray-500">
        <Link href="/" className="hover:text-gray-700">
          Home
        </Link>{" "}
        &rsaquo; <span className="text-gray-700">{dest.name}</span>
      </p>

      <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
        Best eSIM for {dest.name} — Compare Plans &amp; Prices (
        {formatMonthYear(agg.last_updated)})
      </h1>

      <Byline lastUpdated={agg.last_updated} />

      <AnswerBox agg={agg} countryName={dest.name} />

      <section aria-labelledby="plans-heading" className="mt-10">
        <h2 id="plans-heading" className="text-2xl font-semibold tracking-tight">
          All {agg.plan_count} {dest.name} eSIM plans, compared
        </h2>
        <div className="mt-4">
          <FilterablePlanTable
            plans={plans}
            showPurchase={plans.some((p) => p.purchase !== null)}
          />
        </div>
      </section>

      <div className="mt-12">
        <HowWeRank />
        <p className="mt-3 text-sm text-gray-500">
          <Link href="/how-we-rank/" className="text-emerald-700 hover:underline">
            Read the full scoring methodology and normalization rules
          </Link>
          .
        </p>
      </div>

      <div className="mt-12">
        <FaqSection faqs={faqs} countryName={dest.name} agg={agg} />
      </div>

      <div className="mt-12">
        <RelatedDestinations currentCode={dest.code} />
      </div>

      <footer className="mt-12 border-t border-gray-200 pt-6 text-xs text-gray-500">
        <p>
          Data source: MeiSIM public catalog. Plans last verified{" "}
          {formatLongDate(agg.last_updated)} and this page is regenerated
          automatically every 12 hours. Prices are in USD.
        </p>
      </footer>
    </main>
  );
}