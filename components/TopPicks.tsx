import { buildPurchaseLink } from "@/lib/affiliate";
import type { PlanSummary } from "@/lib/data";
import { formatDataGb, formatMoney, formatValidity } from "@/lib/format";

export default function TopPicks({
  plans,
  countryName,
}: {
  plans: PlanSummary[];
  countryName: string;
}) {
  return (
    <section aria-labelledby="top-picks-heading" className="mt-10">
      <h2
        id="top-picks-heading"
        className="text-2xl font-semibold tracking-tight"
      >
        Top eSIM picks for {countryName}
      </h2>
      <ol className="mt-4 divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white">
        {plans.map((p, i) => {
          const link = buildPurchaseLink(p.provider);
          return (
            <li
              key={`${p.provider}-${p.plan_name}-${i}`}
              className="flex items-center gap-4 px-4 py-3"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-900 text-xs font-semibold text-white">
                {i + 1}
              </span>
              <div className="min-w-0">
                <p className="truncate font-medium text-gray-900">
                  {p.plan_name}
                </p>
                <p className="text-xs text-gray-500">
                  {p.provider} · {formatDataGb(p.data_gb, p.unlimited)} ·{" "}
                  {formatValidity(p.validity_days)}
                </p>
              </div>
              <span className="ml-auto shrink-0 font-semibold text-gray-900">
                {formatMoney(p.price, p.currency)}
              </span>
              {link ? (
                <a
                  href={link.href}
                  target="_blank"
                  rel={link.rel}
                  className="shrink-0 rounded-md border border-gray-300 px-2.5 py-1.5 text-xs font-semibold text-gray-700 transition hover:border-emerald-500 hover:text-emerald-700"
                >
                  {link.label}
                </a>
              ) : (
                <span className="shrink-0 text-xs text-gray-300" aria-hidden>
                  —
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}