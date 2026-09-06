import type { DestinationAggregate, Faq, PlanSummary } from "@/lib/data";
import { buildPurchaseLink } from "@/lib/affiliate";
import { getRenderedFaqs } from "@/lib/faq";
import { pageUrl, SITE_NAME } from "@/lib/site";

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: pageUrl(),
  };
}

export function webSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: pageUrl(),
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: pageUrl(item.path),
    })),
  };
}

export function faqPageJsonLd(
  faqs: Faq[],
  countryName: string,
  agg: DestinationAggregate,
) {
  const rendered = getRenderedFaqs(faqs, countryName, agg);
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: rendered.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };
}

/** ItemList of top-ranked plans, used on destination pages. */
export function planItemListJsonLd(
  plans: PlanSummary[],
  country: string,
  slug: string,
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Top eSIM plans for ${country}`,
    itemListElement: plans.slice(0, 5).map((plan, i) => {
      const link = buildPurchaseLink(plan.provider);
      return {
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "Product",
          name: plan.plan_name,
          brand: { "@type": "Brand", name: plan.provider },
          offers: {
            "@type": "Offer",
            price: plan.price,
            priceCurrency: plan.currency || "USD",
          },
          ...(link ? { url: pageUrl(link.href) } : {}),
        },
      };
    }),
    url: pageUrl(`/esim/${slug}/`),
  };
}