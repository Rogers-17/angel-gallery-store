import { CtaBanner } from "@/components/home/cta-banner";
import { Mosaic } from "@/components/home/mosaic";
import { PromoTiles } from "@/components/home/promo-tiles";
import { ArrowLeftIcon, ArrowRightIcon } from "@/components/layout/icons";
import { ProductCard } from "@/components/product/product-card";
import { buttonClasses, ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { ProductGrid } from "@/components/ui/grid";
import { Heading, SectionHeader } from "@/components/ui/heading";
import { Media } from "@/components/ui/media";
import { Section } from "@/components/ui/section";
import { banner, hero, mosaic, productSections, promoTiles } from "@/content/home";
import { getCollectionProducts } from "@/db/queries/catalog";
import { getStoreSettings } from "@/db/queries/settings";

async function ProductSection({ id, collection, title, subtitle, lrdPerUsd }: {
  id: string;
  collection: string;
  title: string;
  subtitle: string;
  lrdPerUsd: number;
}) {
  const products = await getCollectionProducts(collection);
  if (products.length === 0) return null;

  return (
    <Section id={id} spacing="sm" aria-labelledby={`${id}-title`}>
      <Container>
        <SectionHeader id={`${id}-title`} title={title} subtitle={subtitle} className="mb-12" />
        <ProductGrid>
          {products.map((product) => (
            <li key={product.slug}>
              <ProductCard product={product} lrdPerUsd={lrdPerUsd} />
            </li>
          ))}
        </ProductGrid>
        <div className="mt-12 flex justify-center">
          <ButtonLink href="#" variant="outline" size="sm" shape="pill">
            See More Collections
          </ButtonLink>
        </div>
      </Container>
    </Section>
  );
}

export default async function Home() {
  const { lrdPerUsd } = await getStoreSettings();

  return (
    <main className="flex-1">
      {/* Hero: the transparent header floats over it. */}
      <section className="relative">
        {/* Mirrored so the model sits right and the headline left. */}
        <div className="-scale-x-100">
          <Media
            ratio="4/5"
            surface="clay"
            radius="none"
            src={hero.image.src}
            alt={hero.image.alt}
            objectPosition={hero.image.position}
            priority
            className="sm:aspect-video lg:aspect-16/7"
          />
        </div>
        <div className="absolute inset-0 bg-linear-to-r from-ink/80 via-ink/40 to-ink/5" />
        <div className="absolute inset-0 bg-primary/15 mix-blend-multiply" />
        <Container className="absolute inset-0 flex flex-col justify-center pt-header text-cream">
          <Heading as="h1" size="display" className="max-w-2xl">
            {hero.title}
          </Heading>
          <p className="mt-5 max-w-md text-body text-cream/80 md:text-body-lg">{hero.text}</p>
          <ButtonLink href="#new-arrivals" variant="cream" size="md" className="mt-8 self-start">
            Shop Now
          </ButtonLink>
        </Container>
        {/* Decorative carousel controls (no slider yet). */}
        <div aria-hidden className="absolute right-gutter bottom-6 flex gap-2 md:bottom-10">
          <span className={buttonClasses({ variant: "dark", size: "icon" })}><ArrowLeftIcon /></span>
          <span className={buttonClasses({ variant: "dark", size: "icon" })}><ArrowRightIcon /></span>
        </div>
      </section>

      <Section spacing="sm" aria-label="Featured categories">
        <Container>
          <PromoTiles tiles={promoTiles} />
        </Container>
      </Section>

      <ProductSection {...productSections.newArrivals} lrdPerUsd={lrdPerUsd} />

      <Section id="recommended" spacing="sm" aria-labelledby="recommended-title">
        <Container>
          <SectionHeader
            id="recommended-title"
            title="Most Recommended Collections For You"
            subtitle="The edits our customers come back to, from everyday footwear to the bag that goes everywhere."
            className="mb-12"
          />
          <Mosaic {...mosaic} />
        </Container>
      </Section>

      <ProductSection {...productSections.summer} lrdPerUsd={lrdPerUsd} />

      <Section aria-labelledby="banner-title">
        <Container>
          <CtaBanner id="banner-title" {...banner} />
        </Container>
      </Section>
    </main>
  );
}
