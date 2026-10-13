// Public site identity, used for metadata, canonical URLs, sitemap and structured data.

function resolveSiteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (configured) return configured.replace(/\/$/, "");
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  return "http://localhost:3000";
}

export const siteUrl = resolveSiteUrl();
export const siteName = "Angel Gallery";
export const siteDescription =
  "Shoes, bags and clothing from independent makers. Order online and finish on WhatsApp: delivery anywhere in Montserrado County, pay cash on delivery, MTN Mobile Money or Orange Money.";

/** Absolute URL for a path ("/shop") or an already-absolute URL. */
export function absoluteUrl(pathOrUrl: string): string {
  return /^https?:\/\//.test(pathOrUrl) ? pathOrUrl : `${siteUrl}${pathOrUrl.startsWith("/") ? "" : "/"}${pathOrUrl}`;
}
