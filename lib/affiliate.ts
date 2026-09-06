import { getAffiliates } from "@/lib/data";

export interface PurchaseLink {
  href: string;
  rel: string;
  sponsored: boolean;
  label: string;
}

export const REL_NOFOLLOW = "nofollow noopener noreferrer";
export const REL_SPONSORED = "sponsored nofollow noopener noreferrer";

/**
 * Deterministic purchase-link builder. Reads only config/affiliates.json.
 * - affiliate: true  + purchase_url -> sponsored "Buy" link (commission tracked)
 * - affiliate: false + purchase_url -> plain "View" link (no commission)
 * - no purchase_url                 -> null (render no button)
 */
export function buildPurchaseLink(providerName: string): PurchaseLink | null {
  const cfg = getAffiliates()[providerName];
  if (!cfg || !cfg.purchase_url) return null;

  return {
    href: cfg.purchase_url,
    rel: cfg.affiliate ? REL_SPONSORED : REL_NOFOLLOW,
    sponsored: cfg.affiliate,
    label:
      cfg.label ?? (cfg.affiliate ? `Buy on ${providerName}` : `View on ${providerName}`),
  };
}