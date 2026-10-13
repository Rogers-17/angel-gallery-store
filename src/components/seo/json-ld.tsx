import { absoluteUrl } from "@/lib/site";

/**
 * Renders schema.org structured data. `<` is escaped (per the Next.js JSON-LD guide) so a
 * value can never close the script tag.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

export type Crumb = { label: string; href?: string };

export function breadcrumbJsonLd(items: Crumb[], currentPath: string): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: absoluteUrl(item.href ?? currentPath),
    })),
  };
}
