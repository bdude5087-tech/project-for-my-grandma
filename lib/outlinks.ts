import { getAffiliates, getProviders, slugifyProvider } from "@/lib/data";

export interface GoTarget {
  id: string;
  providerName: string;
  url: string;
  sponsored: boolean;
  label?: string;
}

/**
 * Central registry for /go/<id> outbound redirects.
 *
 * Resolution order (single source of truth at build time):
 *   1. config/affiliates.json `purchase_url` — the provider's configured
 *      purchase/landing URL (sponsored when the affiliate flag is set).
 *   2. Catalog-derived `website_url` from providers.json — the provider's own
 *      official registration site extracted from the public catalog, used as a
 *      plain (non-sponsored) fallback.
 *
 * The ranking/scoring pipeline never reads this registry.
 */
export function resolveGoTarget(providerName: string): GoTarget | null {
  const id = slugifyProvider(providerName);
  if (!id) return null;

  const cfg = getAffiliates()[providerName];
  if (cfg?.purchase_url) {
    return {
      id,
      providerName,
      url: cfg.purchase_url,
      sponsored: cfg.affiliate === true,
      label: cfg.label,
    };
  }

  const provider = getProviders().find((p) => p.name === providerName);
  if (provider?.website_url) {
    return { id, providerName, url: provider.website_url, sponsored: false };
  }

  return null;
}

export function getGoById(id: string): GoTarget | null {
  return listGoTargets().find((t) => t.id === id) ?? null;
}

export function listGoTargets(): GoTarget[] {
  const names = new Set<string>();
  for (const p of getProviders()) names.add(p.name);
  for (const key of Object.keys(getAffiliates())) names.add(key);

  const targets: GoTarget[] = [];
  for (const name of Array.from(names).sort()) {
    const target = resolveGoTarget(name);
    if (target) targets.push(target);
  }
  return targets;
}