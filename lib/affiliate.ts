import { resolveGoTarget } from "@/lib/outlinks";

export interface PurchaseLink {
  href: string;
  rel: string;
  sponsored: boolean;
  label: string;
}

export const REL_NOFOLLOW = "nofollow noopener noreferrer";
export const REL_SPONSORED = "sponsored nofollow noopener noreferrer";

/**
 * Deterministic outbound-link builder. Every outbound link goes through the
 * /go/<id> redirect layer so destinations stay centralized and updatable.
 * - affiliate purchase URL configured -> sponsored "Buy" link (commission)
 * - catalog registration site only    -> plain "View" link (no commission)
 * - no target resolved                -> null (render no button)
 */
export function buildPurchaseLink(providerName: string): PurchaseLink | null {
  const target = resolveGoTarget(providerName);
  if (!target) return null;

  return {
    href: `/go/${target.id}/`,
    rel: target.sponsored ? REL_SPONSORED : REL_NOFOLLOW,
    sponsored: target.sponsored,
    label:
      target.label ??
      (target.sponsored
        ? `Buy on ${target.providerName}`
        : `View on ${target.providerName}`),
  };
}