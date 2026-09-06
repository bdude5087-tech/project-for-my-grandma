import type { MetadataRoute } from "next";
import { SITE_BASE_URL } from "@/lib/site";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${SITE_BASE_URL}/sitemap.xml`,
  };
}