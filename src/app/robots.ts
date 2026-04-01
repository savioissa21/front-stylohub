import type { MetadataRoute } from "next";

const DOMAIN = process.env.NEXT_PUBLIC_DOMAIN ?? "stylohub.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/dashboard/",
        "/api/",
        "/r/",
        "/auth/",
        "/checkout/",
        "/onboarding/",
      ],
    },
    sitemap: `https://${DOMAIN}/sitemap.xml`,
  };
}
