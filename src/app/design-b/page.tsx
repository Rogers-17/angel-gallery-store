import { CtaBanner } from "@/components/design-b/cta-banner";
import { ArrowLeftIcon, ArrowRightIcon } from "@/components/design-b/icons";
import { Mosaic } from "@/components/design-b/mosaic";
import { DesignBProductCard } from "@/components/design-b/product-card";
import { PromoTiles } from "@/components/design-b/promo-tiles";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Heading, SectionHeader } from "@/components/ui/heading";
import { Media } from "@/components/ui/media";
import { Section } from "@/components/ui/section";
import {
  banner,
  type BProduct,
  formatPrice,
  hero,
  mosaic,
  newArrivals,
  productHref,
  promoTiles,
  summerCollection,
} from "./_data/catalog";

const arrowButton =
  "inline-flex size-11 items-center justify-center rounded-pill border border-inverse/50 text-inverse";

function ProductSection({ id, title, subtitle, products }: {
  id: string;
  title: string;
  subtitle: string;
  products: BProduct[];
}) {
  return (
    <Section id={id} spacing="sm" aria-labelledby={`${id}-title`}>
      <Container>
        <SectionHeader id={`${id}-title`} title={title} subtitle={subtitle} align="center" className="mb-12" />
        <ul className="grid grid-cols-2 gap-x-4 gap-y-12 lg:grid-cols-3 lg:gap-x-6">
          {products.map((product) => (
            <li key={product.slug}>
              <DesignBProductCard
                href={productHref(product.slug)}
                name={product.name}
                summary={product.summary}
                tag={product.tag}
                price={formatPrice(product.price)}
                compareAtPrice={product.compareAtPrice ? formatPrice(product.compareAtPrice) : undefined}
                badge={product.badge}
                tone={product.tone}
                image={product.image}
              />
            </li>
          ))}
        </ul>
        <div className="mt-12 flex justify-center">
          <ButtonLink href="#" variant="secondary" size="sm" shape="pill">
            See More Collections
          </ButtonLink>
        </div>
      </Container>
    </Section>
  );
}

export default function DesignBHome() {
  return (
    <main className="flex-1">
      {/* Hero: the transparent header floats over it. */}
      <section className="relative">
        {/* Mirrored so the model sits right and the headline left, as in the reference. */}
        <div className="-scale-x-100">
          <Media ratio="4/5" tone="clay" src={hero.image.src} alt={hero.image.alt} objectPosition={hero.image.position} priority className="sm:aspect-video lg:aspect-16/7" />
        </div>
        <div className="absolute inset-0 bg-linear-to-r from-ink/80 via-ink/40 to-ink/5" />
        <div className="absolute inset-0 bg-primary/15 mix-blend-multiply" />
        <Container className="absolute inset-0 flex flex-col justify-center pt-header text-inverse">
          <Heading as="h1" size="display" className="max-w-2xl">
            {hero.title}
          </Heading>
          <p className="mt-5 max-w-md text-body text-inverse/80 md:text-body-lg">{hero.text}</p>
          <ButtonLink href="#new-arrivals" variant="inverse" size="sm" className="mt-8 self-start">
            Shop Now
          </ButtonLink>
        </Container>
        {/* Decorative carousel controls (no slider yet). */}
        <div aria-hidden className="absolute right-gutter bottom-6 flex gap-2 md:bottom-10">
          <span className={arrowButton}><ArrowLeftIcon /></span>
          <span className={`${arrowButton} border-inverse bg-inverse text-ink`}><ArrowRightIcon /></span>
        </div>
      </section>

      {/* Promo tiles */}
      <Section spacing="sm" aria-label="Featured categories">
        <Container>
          <PromoTiles tiles={promoTiles} />
        </Container>
      </Section>

      <ProductSection
        id="new-arrivals"
        title="Newly Dropped Collections"
        subtitle="Fresh footwear from the workshops we work with: timeless shapes, honest materials and built-in comfort."
        products={newArrivals}
      />

      {/* Mosaic */}
      <Section id="recommended" spacing="sm" aria-labelledby="recommended-title">
        <Container>
          <SectionHeader
            id="recommended-title"
            title="Most Recommended Collections For You"
            subtitle="The edits our customers come back to, from everyday footwear to the bag that goes everywhere."
            align="center"
            className="mb-12"
          />
          <Mosaic {...mosaic} />
        </Container>
      </Section>

      <ProductSection
        id="summer"
        title="Summer Collections"
        subtitle="Light layers and bags that carry the season, made in small runs from natural materials."
        products={summerCollection}
      />

      {/* CTA banner */}
      <Section aria-labelledby="banner-title">
        <Container>
          <CtaBanner id="banner-title" {...banner} />
        </Container>
      </Section>
    </main>
  );
}
