import type { DestinationAggregate, Faq } from "@/lib/data";
import { formatMoney } from "@/lib/format";

/** Substitute data placeholders in a hand-authored FAQ string. */
export function renderFaqTemplate(
  text: string,
  countryName: string,
  agg: DestinationAggregate,
): string {
  return text.replace(
    /\{(country|cheapest_plan|cheapest_provider|cheapest_price)\}/g,
    (match) => {
      switch (match) {
        case "{country}":
          return countryName;
        case "{cheapest_plan}":
          return `"${agg.cheapest_plan.plan_name}"`;
        case "{cheapest_provider}":
          return agg.cheapest_plan.provider;
        case "{cheapest_price}":
          return formatMoney(agg.cheapest_plan.price);
        default:
          return match;
      }
    },
  );
}

/** Rendered FAQs (question + answer). Shared by the visible section and JSON-LD so they stay in sync. */
export function getRenderedFaqs(
  faqs: Faq[],
  countryName: string,
  agg: DestinationAggregate,
): Faq[] {
  return faqs.map((faq) => ({
    question: renderFaqTemplate(faq.question, countryName, agg),
    answer: renderFaqTemplate(faq.answer, countryName, agg),
  }));
}