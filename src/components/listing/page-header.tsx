import { Breadcrumb } from "@/components/product/pdp/breadcrumb";
import { breadcrumbJsonLd, type Crumb, JsonLd } from "@/components/seo/json-ld";
import { Heading } from "@/components/ui/heading";

/** Breadcrumb, H1 and intro for listing pages, plus BreadcrumbList structured data. */
export function PageHeader({ crumbs, title, description, path }: {
  crumbs: Crumb[];
  title: string;
  description?: string | null;
  /** Current path, for the last breadcrumb's URL in structured data. */
  path: string;
}) {
  return (
    <header className="pb-10">
      <JsonLd data={breadcrumbJsonLd(crumbs, path)} />
      <Breadcrumb items={crumbs} />
      <Heading as="h1" size="h1" className="mt-5">{title}</Heading>
      {description && <p className="mt-3 max-w-2xl text-body text-muted">{description}</p>}
    </header>
  );
}
