import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getGoById, listGoTargets } from "@/lib/outlinks";

/**
 * Static outbound-redirect layer. Each /go/<id> page is a literal HTML
 * document that jumps to its registered destination via JS (window.location),
 * a no-script meta refresh, and a visible fallback link — Cloudflare Pages
 * needs no server or function. Unknown ids render a 404.
 */
export function generateStaticParams() {
  return listGoTargets().map((target) => ({ id: target.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const target = getGoById(id);
  if (!target) return { robots: { index: false, follow: false } };
  return {
    title: `Redirecting to ${target.providerName}…`,
    description: `Redirecting to the ${target.providerName} website.`,
    alternates: { canonical: null },
    openGraph: null,
    twitter: null,
    robots: { index: false, follow: false },
  };
}

export default async function GoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const target = getGoById(id);
  if (!target) notFound();

  const nextTo = JSON.stringify(target.url);

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center gap-4 px-4 py-24 text-center">
      <noscript>
        <meta httpEquiv="refresh" content={`0; url=${target.url}`} />
      </noscript>
      <script
        dangerouslySetInnerHTML={{
          __html: `try { window.location.replace(${nextTo}); } catch (e) {}`,
        }}
      />
      <h1 className="text-xl font-semibold text-gray-900">Redirecting…</h1>
      <p className="text-sm text-gray-600">
        If you are not redirected automatically, continue to the{" "}
        <a
          href={target.url}
          rel={target.sponsored ? "sponsored noopener noreferrer" : "nofollow noopener noreferrer"}
          className="text-emerald-700 hover:underline"
        >
          {target.providerName} website
        </a>
        .
      </p>
    </main>
  );
}