import type { DestinationAggregate } from "@/lib/data";
import { formatMoney, formatMonthYear, formatPricePerGb } from "@/lib/format";
import PurchaseButton from "@/components/PurchaseButton";

export default function AnswerBox({
  agg,
  countryName,
}: {
  agg: DestinationAggregate;
  countryName: string;
}) {
  const cheapest = agg.cheapest_plan;
  const best = agg.best_value_plan;

  const sentences: string[] = [];

  sentences.push(
    `The cheapest eSIM plan for ${countryName} right now is ${cheapest.plan_name} from ${cheapest.provider} at ${formatMoney(cheapest.price)}.`,
  );

  if (best.plan_name !== cheapest.plan_name) {
    sentences.push(
      `For the best combination of price, data, validity, and coverage, ${best.plan_name} from ${best.provider} ranks highest at ${formatMoney(best.price)}.`,
    );
  }

  const perGbNote = formatPricePerGb(agg.median_price_per_gb);
  sentences.push(
    `We compared ${agg.plan_count} plans across ${agg.provider_count} providers. Prices range from ${formatMoney(agg.price_range.min)} to ${formatMoney(agg.price_range.max)}${
      perGbNote ? `, with a typical price of about ${perGbNote}` : ""
    }.`,
  );

  return (
    <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-5">
      <p className="text-base leading-relaxed text-gray-800 sm:text-lg">
        {sentences.join(" ")}
      </p>
      <p className="mt-2 text-xs text-gray-500">
        Prices verified {formatMonthYear(agg.last_updated)}. Updated every 12
        hours.
      </p>
      <div className="mt-3">
        <PurchaseButton providerName={cheapest.provider} size="md" />
      </div>
    </div>
  );
}