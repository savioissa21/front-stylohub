import type { MetadataRoute } from "next";

const DOMAIN = process.env.NEXT_PUBLIC_DOMAIN ?? "stylohub.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = `https://${DOMAIN}`;
  // Note: individual creator profile pages (/[username]) are intentionally
  // excluded — no backend endpoint to enumerate all public usernames.
  return [
    {
      url: `${base}/`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${base}/marketing`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${base}/marketing/pricing`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${base}/marketing/terms`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.5,
    },
  ];
}
