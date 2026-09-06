import type { MetadataRoute } from "next";
import {
  getComparePairs,
  getDestinationsConfig,
  getMeta,
  providerBySlug,
  slugifyProvider,
} from "@/lib/data";
import { SITE_BASE_URL } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date(getMeta().last_updated);

  const staticPages = [
    { url: `${SITE_BASE_URL}/all-locations/`, priority: 0.7 },
    { url: `${SITE_BASE_URL}/about/`, priority: 0.4 },
    { url: `${SITE_BASE_URL}/how-we-rank/`, priority: 0.5 },
    { url: `${SITE_BASE_URL}/contact/`, priority: 0.3 },
    { url: `${SITE_BASE_URL}/privacy/`, priority: 0.2 },
    { url: `${SITE_BASE_URL}/affiliate-disclosure/`, priority: 0.2 },
  ].map((p) => ({
    ...p,
    lastModified,
    changeFrequency: "monthly" as const,
  }));

  const destinationUrls = getDestinationsConfig().map((d) => ({
    url: `${SITE_BASE_URL}/esim/${d.slug}/`,
    lastModified,
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  const compareUrls = getComparePairs()
    .map(([a, b]) => [slugifyProvider(a), slugifyProvider(b)] as const)
    .filter(([a, b]) => providerBySlug(a) && providerBySlug(b))
    .map(([a, b]) => ({
      url: `${SITE_BASE_URL}/compare/${a}-vs-${b}/`,
      lastModified,
      changeFrequency: "daily" as const,
      priority: 0.6,
    }));

  return [
    {
      url: `${SITE_BASE_URL}/`,
      lastModified,
      changeFrequency: "daily" as const,
      priority: 1,
    },
    ...staticPages,
    ...destinationUrls,
    ...compareUrls,
  ];
}