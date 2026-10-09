import Link from "next/link";
import { ProductCard } from "@/components/product/product-card";
import { Button, ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { ProductGrid } from "@/components/ui/grid";
import { Eyebrow, Heading } from "@/components/ui/heading";
import { Media } from "@/components/ui/media";
import { Section } from "@/components/ui/section";
import { TextLink } from "@/components/ui/text-link";
import { categories, formatPrice, heroImage, journalImage, newArrivals } from "./_demo/catalog";

const values = [
  { title: "Complimentary shipping", body: "On every order over $150, delivered in recyclable packaging." },
  { title: "30-day returns", body: "Changed your mind? Send it back within thirty days, no questions." },
  { title: "Made to last", body: "Small runs from independent workshops, chosen for material and craft." },
];

export default function Home() {
  return (
    <main className="flex-1">
      {/* Hero */}
      <section className="relative">
        <Media
          ratio="4/5"
          tone="sand"
          src={heroImage.src}
          alt={heroImage.alt}
          priority
          className="md:aspect-21/9"
        />
        {/* Darkens the lower half so paper-colored text stays readable on light photos. */}
        <div className="absolute inset-0 bg-linear-to-t from-ink/75 via-ink/25 to-transparent md:via-ink/20" />
        <Container className="absolute inset-x-0 bottom-0 pb-10 text-paper md:pb-16">
          <Eyebrow className="text-paper/80">Autumn edit</Eyebrow>
          <Heading as="h1" size="display" className="mt-4 max-w-3xl">
            Quiet pieces for slower days
          </Heading>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
            <ButtonLink href="#new-in" variant="inverse">Shop new in</ButtonLink>
            <ButtonLink href="#journal" variant="ghost" className="px-0 text-paper">
              Read the journal
            </ButtonLink>
          </div>
        </Container>
      </section>

      {/* Categories */}
      <Section spacing="sm" aria-labelledby="categories-title">
        <Container>
          <Heading id="categories-title" size="h3" className="mb-8">Shop by category</Heading>
          <ul className="scrollbar-none -mx-gutter flex snap-x snap-mandatory gap-3 overflow-x-auto px-gutter md:mx-0 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:px-0">
            {categories.map((category) => (
              <li key={category.name} className="w-[72%] shrink-0 snap-start md:w-auto">
                <Link href="#" className="group block">
                  <Media
                    ratio="3/4"
                    tone={category.tone}
                    src={category.image.src}
                    alt={category.image.alt}
                    objectPosition={category.image.position}
                    sizes="(min-width: 768px) 33vw, 72vw"
                    zoomOnHover
                  />
                  <span className="mt-4 flex items-center justify-between">
                    <span className="font-serif text-h4">{category.name}</span>
                    <span aria-hidden className="transition-transform duration-300 ease-out-soft group-hover:translate-x-1">→</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      {/* New arrivals */}
      <Section id="new-in" spacing="sm" aria-labelledby="new-in-title">
        <Container>
          <div className="mb-10 flex items-end justify-between gap-6">
            <div>
              <Eyebrow>Just arrived</Eyebrow>
              <Heading id="new-in-title" size="h2" className="mt-3">New in</Heading>
            </div>
            <TextLink href="#" className="eyebrow">View all</TextLink>
          </div>
          <ProductGrid>
            {newArrivals.map((product) => (
              <li key={product.id}>
                <ProductCard
                  href="#"
                  name={product.name}
                  detail={product.detail}
                  price={formatPrice(product.price)}
                  compareAtPrice={product.compareAtPrice ? formatPrice(product.compareAtPrice) : undefined}
                  badge={product.badge}
                  soldOut={product.badge === "Sold out"}
                  tone={product.tone}
                  image={product.image}
                />
              </li>
            ))}
          </ProductGrid>
        </Container>
      </Section>

      {/* Editorial split */}
      <Section id="journal" aria-labelledby="journal-title">
        <Container className="grid items-center gap-10 md:grid-cols-2 md:gap-16">
          <Media
            ratio="4/5"
            tone="stone"
            src={journalImage.src}
            alt={journalImage.alt}
            objectPosition="object-[70%_center]"
            sizes="(min-width: 768px) 50vw, 100vw"
          />
          <div className="max-w-md">
            <Eyebrow>From the journal</Eyebrow>
            <Heading id="journal-title" size="h1" className="mt-4">
              Made slowly, by hand
            </Heading>
            <p className="mt-6 text-body-lg text-ink-soft">
              We visit every workshop we work with. This season, a small ceramics studio
              firing in limited batches, each glaze mixed by eye.
            </p>
            <ButtonLink href="#" variant="secondary" className="mt-10">
              Read the story
            </ButtonLink>
          </div>
        </Container>
      </Section>

      {/* Values */}
      <Section spacing="none" divider aria-label="Our promise">
        <Container>
          <ul className="grid md:grid-cols-3">
            {values.map((value) => (
              <li
                key={value.title}
                className="hairline border-b py-10 last:border-b-0 md:border-b-0 md:border-l md:px-8 md:first:border-l-0 md:first:pl-0"
              >
                <h3 className="eyebrow font-sans">{value.title}</h3>
                <p className="mt-3 text-small text-muted">{value.body}</p>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      {/* Newsletter */}
      <Section className="bg-surface" aria-labelledby="newsletter-title">
        <Container width="narrow" className="text-center">
          <Heading id="newsletter-title" size="h2">Letters from the gallery</Heading>
          <p className="mt-4 text-muted">New arrivals, studio visits and the occasional private sale.</p>
          {/* Visual only until the newsletter feature is built. */}
          <div className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row">
            <label htmlFor="newsletter-email" className="sr-only">Email address</label>
            <input id="newsletter-email" type="email" placeholder="Email address" className="field" />
            <Button variant="primary" className="shrink-0">Subscribe</Button>
          </div>
        </Container>
      </Section>
    </main>
  );
}
