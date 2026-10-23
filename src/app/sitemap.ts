import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { services } from "@/lib/catalog";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url;
  return [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/services`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/booking`, changeFrequency: "monthly", priority: 0.8 },
    ...services.map((service) => ({
      url: `${base}/services/${service.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    { url: `${base}/privacy`, changeFrequency: "yearly", priority: 0.2 },
  ];
}
