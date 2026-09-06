import type { DestinationAggregate, Faq } from "@/lib/data";
import { getRenderedFaqs } from "@/lib/faq";

export default function FaqSection({
  faqs,
  countryName,
  agg,
}: {
  faqs: Faq[];
  countryName: string;
  agg: DestinationAggregate;
}) {
  const rendered = getRenderedFaqs(faqs, countryName, agg);

  return (
    <section aria-labelledby="faq-heading">
      <h2 id="faq-heading" className="text-2xl font-semibold tracking-tight">
        Frequently asked questions about eSIMs in {countryName}
      </h2>
      <div className="mt-4 space-y-4">
        {rendered.map((faq, i) => (
          <details
            key={i}
            className="group rounded-xl border border-gray-200 px-5 py-4"
          >
            <summary className="flex cursor-pointer items-center justify-between font-medium text-gray-900">
              {faq.question}
              <span
                className="text-gray-400 transition group-open:rotate-45"
                aria-hidden
              >
                +
              </span>
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-gray-700">
              {faq.answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}