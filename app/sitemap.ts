import type { MetadataRoute } from "next";

const SITE_URL = "https://lexis.hridya.tech";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_URL, lastModified: "2026-11-04", changeFrequency: "monthly", priority: 1 },
    { url: `${SITE_URL}/privacy`, lastModified: "2026-11-04", changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/terms`, lastModified: "2026-11-04", changeFrequency: "yearly", priority: 0.3 },
  ];
}
