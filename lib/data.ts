import { readFileSync } from "fs";
import path from "path";

const ROOT = process.cwd();

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DestinationConfig {
  code: string;
  name: string;
  slug: string;
  url_name?: string;
}

export interface Plan {
  id: string;
  plan_name: string;
  provider: string;
  provider_logo: string | null;
  countries: string[];
  regions: string[];
  data_gb: number | null;
  unlimited: boolean;
  price: number;
  currency: string;
  price_per_gb: number | null;
  validity_days: number | null;
  network: string;
  hotspot: boolean;
  calls: boolean;
  sms: boolean;
  topup: boolean;
  speed: string | null;
  activation_policy: string | null;
  usage_tracking: string | null;
  coverage: string | null;
  externally_shown: boolean;
  only_returns_inventory: boolean;
  source: string;
  source_updated: string | null;
  last_updated: string;
}

export interface Provider {
  name: string;
  logo: string | null;
  plan_count: number;
  country_codes: string[];
  price_min: number;
  price_max: number;
}

export interface ProcessedDestination {
  country_code: string;
  plan_count: number;
  provider_count?: number;
  cheapest_price?: number;
  best_value_plan_name?: string;
  last_updated?: string;
}

export interface PlanSummary {
  plan_name: string;
  provider: string;
  price: number;
  currency: string;
  data_gb: number | null;
  price_per_gb: number | null;
  unlimited: boolean;
  validity_days: number | null;
  network: string;
  value_score?: number;
}

export interface DestinationAggregate {
  country_code: string;
  plan_count: number;
  provider_count: number;
  provider_names: string[];
  cheapest_plan: PlanSummary;
  best_value_plan: PlanSummary;
  best_value_score: number;
  median_price_per_gb: number | null;
  avg_price_per_gb: number | null;
  price_range: { min: number; max: number };
  ranked_plans: PlanSummary[];
  last_updated: string;
}

export interface Scoring {
  weights: {
    price: number;
    data: number;
    validity: number;
    network: number;
    hotspot: number;
    reliability: number;
  };
  normalization: Record<string, unknown>;
  value_score_threshold: number;
}

export interface Faq {
  question: string;
  answer: string;
}

export interface AffiliateConfig {
  affiliate: boolean;
  purchase_url?: string | null;
  label?: string;
}

export interface Meta {
  source: string;
  last_updated: string;
  plan_count: number;
}

// ---------------------------------------------------------------------------
// Build-time JSON reader (cached per process)
// ---------------------------------------------------------------------------

const cache = new Map<string, unknown>();

function readJson<T>(rel: string): T {
  const cached = cache.get(rel);
  if (cached !== undefined) return cached as T;
  const parsed = JSON.parse(
    readFileSync(path.join(ROOT, rel), "utf-8"),
  ) as T;
  cache.set(rel, parsed);
  return parsed;
}

export function getDestinationsConfig(): DestinationConfig[] {
  return readJson<{ destinations: DestinationConfig[] }>(
    "config/destinations.json",
  ).destinations;
}

export function getPlans(): Plan[] {
  return readJson<{ plans: Plan[] }>("data/processed/plans.json").plans;
}

export function getProviders(): Provider[] {
  return readJson<{ providers: Provider[] }>(
    "data/processed/providers.json",
  ).providers;
}

export function getProcessedDestinations(): ProcessedDestination[] {
  return readJson<{ destinations: ProcessedDestination[] }>(
    "data/processed/destinations.json",
  ).destinations;
}

export function getAggregates(): Record<string, DestinationAggregate | null> {
  return readJson<{ aggregates: Record<string, DestinationAggregate | null> }>(
    "data/processed/aggregates.json",
  ).aggregates;
}

export function getMeta(): Meta {
  return readJson<{ meta: Meta }>("data/processed/plans.json").meta;
}

export function getScoring(): Scoring {
  return readJson<Scoring>("config/scoring.json");
}

export function getFaqs(): Faq[] {
  return readJson<{ generic_questions: Faq[] }>("config/faqs.json")
    .generic_questions;
}

export function getAffiliates(): Record<string, AffiliateConfig> {
  return readJson<{ providers: Record<string, AffiliateConfig> }>(
    "config/affiliates.json",
  ).providers;
}

export function getComparePairs(): [string, string][] {
  return readJson<{ pairs: [string, string][] }>("config/compare-pairs.json")
    .pairs;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function slugifyProvider(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getDestBySlug(slug: string): DestinationConfig | undefined {
  return getDestinationsConfig().find((d) => d.slug === slug);
}

export function getDestByCode(code: string): DestinationConfig | undefined {
  return getDestinationsConfig().find((d) => d.code === code);
}

/** All plans that cover a country code, sorted cheapest-first. */
export function getPlansForCountry(code: string): Plan[] {
  return getPlans()
    .filter((p) => p.countries.includes(code))
    .sort((a, b) => a.price - b.price);
}

export function plansForProvider(name: string): Plan[] {
  return getPlans().filter(
    (p) => p.provider.toLowerCase() === name.toLowerCase(),
  );
}

export function providerBySlug(slug: string): Provider | undefined {
  return getProviders().find(
    (p) => slugifyProvider(p.name) === slug.toLowerCase(),
  );
}

/** Median of a list of numbers. */
export function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}