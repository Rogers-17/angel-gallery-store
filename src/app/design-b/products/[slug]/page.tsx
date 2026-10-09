import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HeartIcon } from "@/components/design-b/icons";
import { Breadcrumb } from "@/components/design-b/pdp/breadcrumb";
import { DetailsAccordion } from "@/components/design-b/pdp/details-accordion";
import { ColorPicker, SizePicker } from "@/components/design-b/pdp/option-picker";
import { ProductGallery } from "@/components/design-b/pdp/product-gallery";
import { Quantity } from "@/components/design-b/pdp/quantity";
import { DesignBProductCard } from "@/components/design-b/product-card";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Heading, SectionHeader } from "@/components/ui/heading";
import { toneClass } from "@/components/ui/media";
import { Section } from "@/components/ui/section";
import {
  formatPrice,
  getProduct,
  getRelatedProducts,
  productHref,
  products,
} from "../../_data/catalog";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const product = getProduct((await params).slug);
  return product ? { title: product.name, description: product.summary } : {};
}

const perks = [
  "Free shipping on orders over $150",
  "Free 30-day returns and exchanges",
  "Secure checkout",
];

export default async function ProductPage({ params }: PageProps) {
  const product = getProduct((await params).slug);
  if (!product) notFound();

  const related = getRelatedProducts(product);
  const sectionHref = product.collection === "summer" ? "/design-b#summer" : "/design-b#new-arrivals";

  return (
    <main className="flex-1">
      <Container className="pt-8 pb-section-sm">
        <Breadcrumb
          items={[
            { label: "Home", href: "/design-b" },
            { label: product.department, href: sectionHref },
            { label: product.name },
          ]}
        />

        <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:gap-16">
          <ProductGallery
            src={product.image.src}
            alt={product.image.alt}
            position={product.image.position}
            toneClass={toneClass(product.tone)}
          />

          <div className="flex flex-col gap-8">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-pill bg-surface px-3 py-1 text-small text-ink-soft">{product.tag}</span>
                {product.badge && (
                  <span className="rounded-pill bg-secondary px-3 py-1 text-small text-secondary-fg">{product.badge}</span>
                )}
              </div>
              <Heading as="h1" size="h1" className="mt-4">{product.name}</Heading>
              <p className="mt-4 text-h3 font-semibold tabular-nums">
                {product.compareAtPrice ? (
                  <>
                    <span className="text-accent">{formatPrice(product.price)}</span>{" "}
                    <s className="text-body font-normal text-muted">{formatPrice(product.compareAtPrice)}</s>
                  </>
                ) : (
                  formatPrice(product.price)
                )}
              </p>
              <p className="mt-4 max-w-prose text-body text-ink-soft">{product.summary}</p>
            </div>

            {/* Visual only until the cart feature is built. */}
            <form className="flex flex-col gap-7">
              <ColorPicker name="color" colors={product.colors} />
              <SizePicker name="size" sizes={product.sizes} />
              <Quantity />
              <div className="flex gap-2">
                <div className="grid flex-1 gap-2 sm:grid-cols-2">
                  <Button variant="secondary" size="lg">Add to Cart</Button>
                  <Button variant="primary" size="lg">Buy Now</Button>
                </div>
                <Button variant="secondary" size="lg" aria-label="Add to wishlist" className="shrink-0 px-0! w-14">
                  <HeartIcon />
                </Button>
              </div>
            </form>

            <ul className="flex flex-col gap-2 rounded-card bg-surface p-5 text-small text-ink-soft">
              {perks.map((perk) => (
                <li key={perk} className="flex items-center gap-3">
                  <span aria-hidden className="size-1.5 rounded-pill bg-primary" />
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
                      <p className="mt-3">{product.care}</p>
                    </>
                  ),
                },
                {
                  title: "Shipping & returns",
                  content: (
                    <p>
                      Ships within 2–3 business days. Free standard shipping on orders over $150.
                      Return or exchange unworn items within 30 days.
                    </p>
                  ),
                },
              ]}
            />
          </div>
        </div>
      </Container>

      <Section spacing="sm" divider aria-labelledby="related-title">
        <Container>
          <SectionHeader
            id="related-title"
            title="You May Also Like"
            subtitle="More pieces chosen to go with this one."
            align="center"
            className="mb-12"
          />
          <ul className="grid grid-cols-2 gap-x-4 gap-y-12 lg:grid-cols-3 lg:gap-x-6">
            {related.map((item) => (
              <li key={item.slug}>
                <DesignBProductCard
                  href={productHref(item.slug)}
                  name={item.name}
                  summary={item.summary}
                  tag={item.tag}
                  price={formatPrice(item.price)}
                  compareAtPrice={item.compareAtPrice ? formatPrice(item.compareAtPrice) : undefined}
                  badge={item.badge}
                  tone={item.tone}
                  image={item.image}
                />
              </li>
            ))}
          </ul>
        </Container>
      </Section>
    </main>
  );
}
