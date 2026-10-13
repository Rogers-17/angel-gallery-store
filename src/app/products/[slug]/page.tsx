import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Breadcrumb } from "@/components/product/pdp/breadcrumb";
import { DetailsAccordion } from "@/components/product/pdp/details-accordion";
import { ProductGallery } from "@/components/product/pdp/product-gallery";
import { ProductSkeleton } from "@/components/product/pdp/product-skeleton";
import { VariantPicker } from "@/components/product/pdp/variant-picker";
import { ProductCard } from "@/components/product/product-card";
import { Container } from "@/components/ui/container";
import { ProductGrid } from "@/components/ui/grid";
import { Heading, SectionHeader } from "@/components/ui/heading";
import { Section } from "@/components/ui/section";
import { Tag } from "@/components/ui/tag";
import { getActiveProductSlugs, getProductBySlug, getRelatedProducts } from "@/db/queries/catalog";
import { breadcrumbJsonLd, JsonLd } from "@/components/seo/json-ld";
import { getStoreSettings } from "@/db/queries/settings";
import type { ProductDetail } from "@/db/queries/types";
import { formatRate } from "@/lib/money";
import { absoluteUrl, siteName } from "@/lib/site";

type PageProps = { params: Promise<{ slug: string }> };

const badgeLabels = { new: "New", bestseller: "Bestseller" } as const;

const rateDateFormatter = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });

const perks = [
  "Order on WhatsApp: we confirm delivery and payment with you in the chat",
  "Delivery anywhere in Montserrado County, or pickup by arrangement",
  "Pay cash on delivery, MTN Mobile Money or Orange Money",
];

export async function generateStaticParams() {
  const slugs = await getActiveProductSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const product = await getProductBySlug((await params).slug);
  if (!product) return {};
  const image = product.images[0];
  return {
    title: product.seoTitle ?? product.name,
    description: product.seoDescription ?? product.summary,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      type: "website",
      title: product.name,
      description: product.summary,
      images: image ? [{ url: image.url, alt: image.alt }] : undefined,
    },
  };
}

function productJsonLd(product: ProductDetail): Record<string, unknown> {
  const prices = product.variants.map((v) => v.priceCents);
  const inStock = product.variants.some((v) => v.stock > 0);
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images.map((i) => absoluteUrl(i.url)),
    sku: product.variants[0]?.sku,
    brand: { "@type": "Brand", name: siteName },
    category: product.category.name,
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "USD",
      lowPrice: (Math.min(...prices) / 100).toFixed(2),
      highPrice: (Math.max(...prices) / 100).toFixed(2),
      offerCount: product.variants.length,
      availability: inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: absoluteUrl(`/products/${product.slug}`),
    },
  };
}

// Reading `params` suspends, so the product renders inside <Suspense>: navigations show the
// skeleton instantly instead of blocking (instant navigation, Cache Components).
export default function ProductPage({ params }: PageProps) {
  return (
    <Suspense fallback={<ProductSkeleton />}>
      <ProductDetails params={params} />
    </Suspense>
  );
}

async function ProductDetails({ params }: PageProps) {
  const product = await getProductBySlug((await params).slug);
  if (!product) notFound();

  const [related, settings] = await Promise.all([
    getRelatedProducts(product.id, product.category.id),
    getStoreSettings(),
  ]);
  const primaryImage = product.images[0];
  const crumbs = [
    { label: "Home", href: "/" },
    { label: product.category.name, href: `/shop/${product.category.slug}` },
    { label: product.name },
  ];

  return (
    <main className="flex-1">
      <JsonLd data={productJsonLd(product)} />
      <JsonLd data={breadcrumbJsonLd(crumbs, `/products/${product.slug}`)} />
      <Container className="pt-8 pb-section-sm">
        <Breadcrumb items={crumbs} />

        <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:gap-16">
          {primaryImage && (
            <ProductGallery
              src={primaryImage.url}
              alt={primaryImage.alt}
              position={primaryImage.objectPosition ?? undefined}
            />
          )}

          <div className="flex flex-col gap-8">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Tag>{product.tag}</Tag>
                {product.badge && <Tag>{badgeLabels[product.badge]}</Tag>}
              </div>
              <Heading as="h1" size="h1" className="mt-4">{product.name}</Heading>
              <p className="mt-4 max-w-prose text-body text-ink-soft">{product.summary}</p>
            </div>

            <VariantPicker variants={product.variants} lrdPerUsd={settings.lrdPerUsd} />

            <p className="text-caption text-muted">
              Prices in USD. LRD amounts are approximate at {formatRate(settings.lrdPerUsd)} per $1
              (updated {rateDateFormatter.format(new Date(settings.lrdRateUpdatedAt))}).
            </p>

            <ul className="flex flex-col gap-2 rounded-card bg-surface p-5 text-small text-ink-soft">
              {perks.map((perk) => (
                <li key={perk} className="flex items-center gap-3">
                  <span aria-hidden className="size-1.5 shrink-0 rounded-pill bg-primary" />
                  {perk}
                </li>
              ))}
            </ul>

            <DetailsAccordion
              items={[
                { title: "Description", content: <p>{product.description}</p>, open: true },
                {
                  title: "Materials & care",
                  content: (
                    <>
                      <ul className="list-disc pl-5">
                        {product.materials.map((material) => <li key={material}>{material}</li>)}
                      </ul>
                      {product.care && <p className="mt-3">{product.care}</p>}
                    </>
                  ),
                },
                {
                  title: "Delivery & payment",
                  content: (
                    <p>
                      Place your order and send it to us on WhatsApp. We agree the delivery fee, time
                      and payment with you in the chat. We deliver anywhere in Montserrado County, and
                      pickup can be arranged. Pay cash on delivery, by MTN Mobile Money or by Orange Money.
                    </p>
                  ),
                },
              ]}
            />
          </div>
        </div>
      </Container>

      {related.length > 0 && (
        <Section spacing="sm" divider aria-labelledby="related-title">
          <Container>
            <SectionHeader
              id="related-title"
              title="You May Also Like"
              subtitle="More pieces chosen to go with this one."
              className="mb-12"
            />
            <ProductGrid>
              {related.map((item) => (
                <li key={item.slug}>
                  <ProductCard product={item} lrdPerUsd={settings.lrdPerUsd} />
                </li>
              ))}
            </ProductGrid>
          </Container>
        </Section>
      )}
    </main>
  );
}
