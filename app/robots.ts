import type { MetadataRoute } from "next";
import { IS_INDEXABLE, SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  // Preview deployments are for review only: keep them out of search engines.
  if (!IS_INDEXABLE) return { rules: [{ userAgent: "*", disallow: "/" }] };
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/miembros", "/acceso", "/api/"] }],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
