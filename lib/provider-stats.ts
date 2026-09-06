import {
  getDestByCode,
  median,
  plansForProvider,
  slugifyProvider,
} from "@/lib/data";

export interface ProviderStats {
  name: string;
  slug: string;
  plan_count: number;
  destination_codes: string[];
  price_min: number;
  price_max: number;
  median_price_per_gb: number | null;
  five_g_share: number;
  unlimited_count: number;
}

export function buildProviderStats(name: string): ProviderStats {
  const plans = plansForProvider(name);
  const destCodes = [...new Set(plans.flatMap((p) => p.countries))].filter(
    (c) => getDestByCode(c) !== undefined,
  );
  const prices = plans.map((p) => p.price);
  const perGb = plans
    .map((p) => p.price_per_gb)
    .filter((v): v is number => v !== null);
  const fiveG = plans.filter((p) => p.network === "5G").length;

  return {
    name,
    slug: slugifyProvider(name),
    plan_count: plans.length,
    destination_codes: destCodes,
    price_min: prices.length ? Math.min(...prices) : 0,
    price_max: prices.length ? Math.max(...prices) : 0,
    median_price_per_gb: median(perGb),
    five_g_share: plans.length ? fiveG / plans.length : 0,
    unlimited_count: plans.filter((p) => p.unlimited).length,
  };
}

/** Deterministic verdict logic — no AI, no randomization. */
export function verdict(a: ProviderStats, b: ProviderStats): {
  leading: ProviderStats;
  summary: string;
} {
  let aScore = 0;
  let bScore = 0;
  const reasons: string[] = [];

  if ((a.median_price_per_gb ?? 99) < (b.median_price_per_gb ?? 99)) {
    aScore += 2;
    reasons.push(
      `${a.name} has the lower median price per GB ($${a.median_price_per_gb?.toFixed(2)} vs $${b.median_price_per_gb?.toFixed(2)}).`,
    );
  } else if ((b.median_price_per_gb ?? 99) < (a.median_price_per_gb ?? 99)) {
    bScore += 2;
    reasons.push(
      `${b.name} has the lower median price per GB ($${b.median_price_per_gb?.toFixed(2)} vs $${a.median_price_per_gb?.toFixed(2)}).`,
    );
  }

  if (a.plan_count > b.plan_count) {
    aScore += 1;
    reasons.push(`${a.name} offers more plan options (${a.plan_count} vs ${b.plan_count}).`);
  } else if (b.plan_count > a.plan_count) {
    bScore += 1;
    reasons.push(`${b.name} offers more plan options (${b.plan_count} vs ${a.plan_count}).`);
  }

  if (a.destination_codes.length > b.destination_codes.length) {
    aScore += 1;
    reasons.push(`${a.name} covers more of the destinations we track.`);
  } else if (b.destination_codes.length > a.destination_codes.length) {
    bScore += 1;
    reasons.push(`${b.name} covers more of the destinations we track.`);
  }

  if (a.five_g_share > b.five_g_share) {
    aScore += 1;
    reasons.push(`${a.name} has a higher share of 5G plans.`);
  } else if (b.five_g_share > a.five_g_share) {
    bScore += 1;
    reasons.push(`${b.name} has a higher share of 5G plans.`);
  }

  const leading = aScore >= bScore ? a : b;
  const summary =
    reasons[0] ??
    "Both providers score closely for price, plan choice, and coverage.";
  return { leading, summary };
}