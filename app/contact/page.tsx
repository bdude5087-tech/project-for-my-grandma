import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import { breadcrumbJsonLd } from "@/lib/json-ld";
import { CONTACT_EMAIL, SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "How to reach the EsimRates team about data corrections, partnership questions, or privacy concerns.",
  alternates: { canonical: "/contact/" },
  openGraph: {
    type: "website",
    url: "/contact/",
    title: "Contact EsimRates",
    description: "Corrections, partnerships, and privacy requests.",
  },
};

export default function ContactPage() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12 sm:px-6">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Contact", path: "/contact/" },
        ])}
      />

      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
        Contact {SITE_NAME}
      </h1>

      <p className="mt-6 leading-relaxed text-gray-700">
        The fastest way to reach us is email:{" "}
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="text-emerald-700 hover:underline"
        >
          {CONTACT_EMAIL}
        </a>
      </p>

      <h2 className="mt-10 text-2xl font-semibold tracking-tight">
        Reporting a data error
      </h2>
      <p className="mt-4 leading-relaxed text-gray-700">
        If a plan&rsquo;s price, data allowance, validity, or coverage looks
        wrong, include the destination, the plan name, and the provider so we
        can find it in the source catalog. We re-verify on the next ingest
        cycle (every 12 hours) and re-run the affected destination.
      </p>

      <h2 className="mt-10 text-2xl font-semibold tracking-tight">
        Providers and partners
      </h2>
      <p className="mt-4 leading-relaxed text-gray-700">
        For provider partnerships or affiliate questions, use the same address.
        Please note: paying for placement is not a thing we offer — a
        partnership covers tracking links and commission only, never a score.
      </p>

      <h2 className="mt-10 text-2xl font-semibold tracking-tight">
        Privacy requests
      </h2>
      <p className="mt-4 leading-relaxed text-gray-700">
        This site has no accounts, no comments, and no forms, so there is
        usually nothing of yours to delete. For anything specific (for example
        a correction tied to your name), email us and we will respond within
        seven days. See the{" "}
        <Link href="/privacy/" className="text-emerald-700 hover:underline">
          privacy policy
        </Link>{" "}
        for details.
      </p>

      <p className="mt-8 text-xs text-gray-500">
        We respond to genuine corrections before unsolicited pitches, and we
        never sell your contact details — mostly because we don&rsquo;t keep
        them.
      </p>
    </main>
  );
}