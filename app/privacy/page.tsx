import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import { breadcrumbJsonLd } from "@/lib/json-ld";
import { CONTACT_EMAIL, SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy policy",
  description:
    "What RoamRank collects, why, and what we never collect. No accounts, no forms, no tracking walls.",
  alternates: { canonical: "/privacy/" },
  openGraph: {
    type: "website",
    url: "/privacy/",
    title: "Privacy policy for RoamRank",
    description: "We collect almost nothing. This page documents exactly what.",
  },
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12 sm:px-6">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Privacy", path: "/privacy/" },
        ])}
      />

      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
        Privacy policy
      </h1>
      <p className="mt-3 text-sm text-gray-500">
        Last updated: September 2026 · Applies to {SITE_NAME}
      </p>

      <h2 className="mt-10 text-2xl font-semibold tracking-tight">
        The short version
      </h2>
      <p className="mt-4 leading-relaxed text-gray-700">
        This site runs with no user accounts, no comment forms, no newsletter,
        and no on-site tracking setup of its own. There is no database and
        nothing for you to sign up for, so there is very little personal data
        to collect, store, or lose.
      </p>

      <h2 className="mt-10 text-2xl font-semibold tracking-tight">
        What we collect
      </h2>
      <ul className="mt-4 list-disc space-y-2 pl-5 leading-relaxed text-gray-700">
        <li>
          <strong>Nothing on our servers.</strong> Pages are pre-rendered
          static files; we do not run comment, account, or analytics
          infrastructure of our own.
        </li>
        <li>
          <strong>Standard hosting logs.</strong> Our host (Cloudflare Pages)
          may log request basics — IP address, user agent, requested URL — for
          security and abuse prevention, exactly as any web host does.
        </li>
        <li>
          <strong>Affiliate redirects.</strong> When you click a purchase link
          that carries an affiliate tag, the vendor&rsquo;s program may set a
          cookie on their domain to credit the referral. That is set and read
          by the vendor, not by us.
        </li>
      </ul>

      <h2 className="mt-10 text-2xl font-semibold tracking-tight">
        What we never collect
      </h2>
      <ul className="mt-4 list-disc space-y-2 pl-5 leading-relaxed text-gray-700">
        <li>Names, email addresses, or phone numbers (no forms exist).</li>
        <li>
          Account or payment data (we do not sell anything and never store a
          card).
        </li>
        <li>
          Precise location. Country pages are chosen by URL; we don&rsquo;t
          geo-locate visitors.
        </li>
      </ul>

      <h2 className="mt-10 text-2xl font-semibold tracking-tight">
        Cookies &amp; tracking
      </h2>
      <p className="mt-4 leading-relaxed text-gray-700">
        We do not set first-party cookies or run third-party analytics on this
        site. In the future, if we add analytics, we will only use
        cookieless, aggregate numbers, and this page will be updated before
        that ships.
      </p>

      <h2 className="mt-10 text-2xl font-semibold tracking-tight">
        Data corrections &amp; removals
      </h2>
      <p className="mt-4 leading-relaxed text-gray-700">
        If you believe published data mentions you in a way that is wrong or
        should be removed, email{" "}
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="text-emerald-700 hover:underline"
        >
          {CONTACT_EMAIL}
        </a>{" "}
        with the relevant URL and we will resolve it within seven days.
      </p>

      <h2 className="mt-10 text-2xl font-semibold tracking-tight">
        Third-party pages
      </h2>
      <p className="mt-4 leading-relaxed text-gray-700">
        Purchase and provider links leave this site. Their privacy practices
        are theirs — see the{" "}
        <Link href="/affiliate-disclosure/" className="text-emerald-700 hover:underline">
          affiliate disclosure
        </Link>{" "}
        for details on which links are affiliate-tracked.
      </p>
    </main>
  );
}