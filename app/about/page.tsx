import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import { breadcrumbJsonLd } from "@/lib/json-ld";
import { CONTACT_EMAIL, EDITOR, SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description:
    "EsimRates is an independent, ad-free price comparison site for eSIM data plans. Every ranking is computed from real catalog data using transparent, deterministic rules.",
  alternates: { canonical: "/about/" },
  openGraph: {
    type: "website",
    url: "/about/",
    title: "About EsimRates",
    description:
      "Independent, transparent eSIM price comparison. Every ranking is data-driven and never paid for.",
  },
};

export default function AboutPage() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12 sm:px-6">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "About", path: "/about/" },
        ])}
      />

      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
        About {SITE_NAME}
      </h1>

      <p className="mt-6 text-lg leading-relaxed text-gray-700">
        {SITE_NAME} is an independent price comparison site for eSIM data
        plans. Our job is simple: show you every real plan for a destination,
        the cheapest one, and the one we would buy — and tell you exactly how
        we decided.
      </p>

      <h2 className="mt-10 text-2xl font-semibold tracking-tight">
        What we do
      </h2>
      <div className="mt-4 space-y-4 leading-relaxed text-gray-700">
        <p>
          Every twelve hours we pull the public eSIM catalogs for our tracked
          destinations, normalize every plan to one schema (price, data,
          validity, network type, hotspot support), and drop records that are
          broken or can&rsquo;t be bought as data. No plan is advertised to us;
          we read the same catalogs you can.
        </p>
        <p>
          We then score every plan with a fixed, published formula — price per
          GB matters most, followed by data allowance, validity, network
          generation, hotspot support, and reliability.{" "}
          <Link href="/how-we-rank" className="text-emerald-700 hover:underline">
            The full methodology is here.
          </Link>
        </p>
      </div>

      <h2 className="mt-10 text-2xl font-semibold tracking-tight">
        No paid placements, ever
      </h2>
      <p className="mt-4 leading-relaxed text-gray-700">
        Providers cannot pay for a higher score, a better position, or a
        mention in an answer. We do work with affiliate links — when you buy
        through one we may earn a commission — but an affiliate relationship
        never changes a plan&rsquo;s score or position.{" "}
        <Link href="/affiliate-disclosure" className="text-emerald-700 hover:underline">
          Read the full disclosure
        </Link>
        .
      </p>

      <h2 className="mt-10 text-2xl font-semibold tracking-tight">
        No AI-generated rankings
      </h2>
      <p className="mt-4 leading-relaxed text-gray-700">
        Rankings, answer boxes, and comparisons on this site are computed by
        deterministic rules over real catalog data. No large language model
        writes, scores, or ranks anything we publish. Every number you see
        traces back to a catalog record or a formula in{" "}
        <code className="rounded bg-gray-100 px-1.5 py-0.5 text-sm">config/scoring.json</code>.
      </p>

      <h2 className="mt-10 text-2xl font-semibold tracking-tight">
        When we get it wrong
      </h2>
      <p className="mt-4 leading-relaxed text-gray-700">
        Catalogs change. If a price is stale, a plan is discontinued, or a
        country flag is wrong, email us and we will investigate on the next
        ingest cycle. Corrections that affect published numbers are noted in
        the page footer when the data is refreshed.
      </p>

      <h2 className="mt-10 text-2xl font-semibold tracking-tight">
        Who runs it
      </h2>
      <p className="mt-4 leading-relaxed text-gray-700">
        {EDITOR.name} ({EDITOR.role}). Reach us at{" "}
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="text-emerald-700 hover:underline"
        >
          {CONTACT_EMAIL}
        </a>{" "}
        or via the <Link href="/contact" className="text-emerald-700 hover:underline">contact page</Link>.
      </p>

      <h2 className="mt-10 text-2xl font-semibold tracking-tight">
        Where to go next
      </h2>
      <p className="mt-4 leading-relaxed text-gray-700">
        Editorial standards and the outbound-link policy are documented on the{" "}
        <Link href="/how-we-rank" className="text-emerald-700 hover:underline">
          How we rank
        </Link>{" "}
        page. To start comparing plans, head to the{" "}
        <Link href="/" className="text-emerald-700 hover:underline">
          homepage
        </Link>
        .
      </p>
    </main>
  );
}