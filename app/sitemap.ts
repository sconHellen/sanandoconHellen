import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Only public, indexable pages. Legal pages join once their final texts are published.
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1 }];
}
