import { getScoring } from "@/lib/data";

const FACTOR_LABELS: Record<string, string> = {
  price: "Price (lower price/GB scores higher)",
  data: "Data allowance",
  validity: "Validity length",
  network: "Network generation (5G > 4G)",
  hotspot: "Hotspot/tethering support",
  reliability: "Provider reliability",
};

export default function HowWeRank() {
  const { weights } = getScoring();
  const rows = Object.entries(weights)
    .filter(([key]) => key in FACTOR_LABELS)
    .map(([key, value]) => ({ key, label: FACTOR_LABELS[key], weight: value }))
    .sort((a, b) => b.weight - a.weight);

  return (
    <section aria-labelledby="how-we-rank">
      <h2 id="how-we-rank" className="text-2xl font-semibold tracking-tight">
        How we rank these plans
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-gray-700">
        Every plan is scored with the same transparent, weight-based formula.
        Within each destination, plans are normalized against the cheapest
        price per GB, largest data allowance, and longest validity, then
        weighted below. No sponsored placements change a score.
      </p>
      <dl className="mt-4 grid gap-3 sm:grid-cols-2">
        {rows.map((row) => (
          <div
            key={row.key}
            className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3"
          >
            <dt className="text-sm font-medium text-gray-900">{row.label}</dt>
            <dd className="font-mono text-sm text-gray-500">
              {Math.round(row.weight * 100)}%
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}