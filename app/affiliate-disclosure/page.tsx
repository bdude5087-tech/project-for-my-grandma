import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import { breadcrumbJsonLd } from "@/lib/json-ld";
import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "Affiliate disclosure",
  description:
    "How affiliate links work on RoamRank, and why they never change a plan's score or position.",
  alternates: { canonical: "/affiliate-disclosure/" },
  openGraph: {
    type: "website",
    url: "/affiliate-disclosure/",
    title: "Affiliate disclosure",
    description:
      "We may earn commissions on purchase links — and it never affects a ranking.",
  },
};

export default function AffiliateDisclosurePage() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12 sm:px-6">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Affiliate disclosure", path: "/affiliate-disclosure/" },
        ])}
      />

      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
        Affiliate disclosure
      </h1>

      <p className="mt-6 leading-relaxed text-gray-700">
        {SITE_NAME} is reader-supported. When you click a purchase link on this
        site and buy an eSIM plan, we may earn a commission from the provider
        at no extra cost to you. That is the whole of our money-making
        arrangement, and it is the only source of revenue on this site.
      </p>

      <h2 className="mt-10 text-2xl font-semibold tracking-tight">
        Does it change rankings? No.
      </h2>
      <p className="mt-4 leading-relaxed text-gray-700">
        Our ranking formula is stored in a public config file and computed
        deterministically from catalog data. An affiliate relationship can
        never raise or lower a score, move a plan in a table, or add a plan to
        an answer box. We do not accept payment for placement, reviews,
        removals, or mentions — and we turn down such offers rather than mix
        them with rankings.
      </p>

      <h2 className="mt-10 text-2xl font-semibold tracking-tight">
        How you can tell
      </h2>
      <p className="mt-4 leading-relaxed text-gray-700">
        Purchase buttons on provider pages carry a small &ldquo;affiliate&rdquo;
        marker next to the price, and the{" "}
        <Link href="/how-we-rank/" className="text-emerald-700 hover:underline">
          methodology page
        </Link>{" "}
        documents which outbound links are citations versus purchase links.
        When in doubt, treat every provider link as a potential affiliate link
        — the ranking is still the ranking.
      </p>

      <h2 className="mt-10 text-2xl font-semibold tracking-tight">
        Cookies
      </h2>
      <p className="mt-4 leading-relaxed text-gray-700">
        Affiliate links redirect through the provider&rsquo;s program, which
        may set a cookie on the provider&rsquo;s domain to credit the referral.
        Our site itself sets no first-party cookies and collects no personal
        data; see the{" "}
        <Link href="/privacy/" className="text-emerald-700 hover:underline">
          privacy policy
        </Link>
        .
      </p>
    </main>
  );
}