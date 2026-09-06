// Deterministic plan-fit matcher for the homepage finder. No I/O — safe for
// client and server components. Selection order is a published, stable rule:
//  1. Tier 1 — covers trip (validity >= days) AND data need AND budget
//  2. Tier 2 — covers trip + data, budget ignored
//  3. Tier 3 — covers trip + budget, data relaxed (may need topping up)
//  4. Tier 4 — blinds, ranked by destination value_score (closest we have)
// Within a tier: highest value_score first, then lowest price.
// Unlimited daily means the user wants a truly unlimited plan.

import type { SearchIndexDestination, SearchIndexPlan } from "@/lib/data";

export interface FinderNeeds {
  days: number;
  /** GB per day. `null` means "unlimited daily" (only unlimited plans fit). */
  dataPerDayGb: number | null;
  /** Optional max price in USD. `null` = no budget constraint. */
  maxPrice: number | null;
}

export interface PlanSuggestion {
  plan: SearchIndexPlan;
  destination: {
    code: string;
    name: string;
    slug: string;
  };
  coversData: boolean;
  coversValidity: boolean;
  withinBudget: boolean;
  relaxedReason: string | null;
}

export interface FinderResult {
  destination: SearchIndexDestination | null;
  suggestions: PlanSuggestion[];
  relaxed: boolean;
  matchedCount: number;
  totalPlans: number;
}

export function normalizeCountryQuery(
  query: string,
  dests: SearchIndexDestination[],
): SearchIndexDestination | null {
  const q = query.trim().toLowerCase();
  if (!q) return null;
  return (
    dests.find((d) => {
      const aliases = [d.name, d.url_name, d.slug, d.code]
        .filter(Boolean)
        .map((a) => a!.toLowerCase());
      return aliases.some(
        (a) => a === q || a.includes(q) || q.includes(a),
      );
    }) ?? null
  );
}

function meetsData(plan: SearchIndexPlan, neededGb: number): boolean {
  if (neededGb === Number.POSITIVE_INFINITY) return plan.unlimited;
  if (plan.unlimited) return true;
  return (plan.data_gb ?? 0) >= neededGb;
}

function meetsValidity(plan: SearchIndexPlan, days: number): boolean {
  return (plan.validity_days ?? 0) >= days;
}

function meetsBudget(plan: SearchIndexPlan, maxPrice: number | null): boolean {
  if (maxPrice === null) return true;
  return plan.price <= maxPrice;
}

function tierOf(
  plan: SearchIndexPlan,
  neededGb: number,
  days: number,
  maxPrice: number | null,
): number {
  const data = meetsData(plan, neededGb);
  const valid = meetsValidity(plan, days);
  const budget = meetsBudget(plan, maxPrice);

  if (valid && data && budget) return 1;
  if (valid && data) return 2;
  if (valid && budget) return 3;
  return 4;
}

export function suggestPlans(
  destination: SearchIndexDestination,
  needs: FinderNeeds,
): Omit<FinderResult, "destination"> {
  const days = Math.max(1, Math.round(needs.days) || 1);
  const neededGb =
    needs.dataPerDayGb === null
      ? Number.POSITIVE_INFINITY
      : Math.max(0, needs.dataPerDayGb) * days;

  type Scored = { plan: SearchIndexPlan; tier: number; value: number };
  const scored: Scored[] = destination.plans
    .map((plan) => ({
      plan,
      tier: tierOf(plan, neededGb, days, needs.maxPrice),
      value: plan.value_score,
    }))
    .sort((a, b) => a.tier - b.tier || b.value - a.value || a.plan.price - b.plan.price);

  if (scored.length === 0) {
    return { suggestions: [], relaxed: false, matchedCount: 0, totalPlans: 0 };
  }

  const bestTier = scored[0].tier;
  const top = scored.filter((s) => s.tier === bestTier).slice(0, 5);

  const suggestions: PlanSuggestion[] = top.map(({ plan }) => {
    const relaxedReason =
      bestTier === 1
        ? null
        : bestTier === 2
          ? "No plan in budget — closest match without it."
          : bestTier === 3
            ? "No plan with enough data — closest match, may need a top-up."
            : "Nothing meets your needs exactly — our best-value picks for this destination.";

    return {
      plan,
      destination: {
        code: destination.code,
        name: destination.name,
        slug: destination.slug,
      },
      coversData: meetsData(plan, neededGb),
      coversValidity: meetsValidity(plan, days),
      withinBudget: meetsBudget(plan, needs.maxPrice),
      relaxedReason,
    };
  });

  return {
    suggestions,
    relaxed: bestTier > 1,
    matchedCount: scored.filter((s) => s.tier === 1).length,
    totalPlans: scored.length,
  };
}