import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ArrowLeftIcon, ArrowRightIcon, HeartIcon, MailIcon } from "@/components/layout/icons";
import { ProductCard } from "@/components/product/product-card";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { ProductGrid } from "@/components/ui/grid";
import { Heading, SectionHeader } from "@/components/ui/heading";
import { Media, type MediaTone } from "@/components/ui/media";
import { Section } from "@/components/ui/section";
import { Tag } from "@/components/ui/tag";
import { TextLink } from "@/components/ui/text-link";
import { formatPrice, productHref, products } from "../_data/catalog";

export const metadata: Metadata = { title: "Design system" };

// Literal class names so Tailwind generates them.
const colorGroups: { title: string; colors: { name: string; swatch: string; note: string }[] }[] = [
  {
    title: "Canvas & ink",
    colors: [
      { name: "paper", swatch: "bg-paper", note: "Page background" },
      { name: "ink", swatch: "bg-ink", note: "Text, dark surfaces" },
      { name: "ink-soft", swatch: "bg-ink-soft", note: "Secondary text" },
      { name: "muted", swatch: "bg-muted", note: "Captions, meta" },
    ],
  },
  {
    title: "Brand",
    colors: [
      { name: "primary", swatch: "bg-primary", note: "Main actions, sale price" },
      { name: "secondary", swatch: "bg-secondary", note: "Companion actions" },
      { name: "cream", swatch: "bg-cream", note: "On photos and dark" },
      { name: "tag", swatch: "bg-tag", note: "Category pills" },
    ],
  },
  {
    title: "Surfaces & lines",
    colors: [
      { name: "surface", swatch: "bg-surface", note: "Quiet panels" },
      { name: "well", swatch: "well", note: "Product image wells" },
      { name: "espresso-soft", swatch: "bg-espresso-soft", note: "Controls on dark" },
      { name: "line", swatch: "bg-line", note: "Hairlines" },
    ],
  },
];

const typeScale = [
  { token: "text-display", className: "font-display text-display font-heading", sample: "Display Heading" },
  { token: "text-h1", className: "font-display text-h1 font-heading", sample: "Heading One" },
  { token: "text-h2", className: "font-display text-h2 font-heading", sample: "Heading Two" },
  { token: "text-h3", className: "font-display text-h3 font-heading", sample: "Heading Three" },
  { token: "text-h4", className: "font-display text-h4 font-heading", sample: "Heading Four" },
  { token: "text-price", className: "text-price font-semibold tabular-nums", sample: "$229.96" },
  { token: "text-body-lg", className: "text-body-lg", sample: "Large body for hero and introductions." },
  { token: "text-body", className: "text-body", sample: "Body text for descriptions, forms and general UI." },
  { token: "text-small", className: "text-small", sample: "Small text for navigation, buttons and meta." },
  { token: "text-caption", className: "text-caption text-muted", sample: "Caption for product summaries and fine print." },
];

const tones: MediaTone[] = ["sand", "stone", "clay", "sage", "mist", "umber"];

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Section spacing="sm" divider>
      <Container>
        <Heading size="h3" className="mb-8">{title}</Heading>
        {children}
      </Container>
    </Section>
  );
}

function Label({ children }: { children: ReactNode }) {
  return <code className="font-mono text-caption text-muted">{children}</code>;
}

export default function DesignSystemPage() {
  const sample = products.slice(0, 3);

  return (
    <main className="flex-1">
      <Section spacing="sm">
        <Container>
          <SectionHeader
            title="Design System"
            subtitle="Tokens live in src/styles/theme.css, primitives in src/styles/components.css and src/components/ui."
            align="start"
          />
        </Container>
      </Section>

      <Block title="Color">
        <div className="flex flex-col gap-10">
          {colorGroups.map((group) => (
            <div key={group.title}>
              <p className="mb-4 text-small font-medium">{group.title}</p>
              <ul className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {group.colors.map((color) => (
                  <li key={color.name}>
                    <div className={`hairline aspect-4/3 rounded-control border ${color.swatch}`} />
                    <p className="mt-2 text-small font-medium">{color.name}</p>
                    <p className="text-caption text-muted">{color.note}</p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div>
            <p className="mb-4 text-small font-medium">Image tones (placeholders and loading backgrounds)</p>
            <ul className="grid grid-cols-3 gap-4 sm:grid-cols-6">
              {tones.map((tone) => (
                <li key={tone}>
                  <Media ratio="1/1" surface={tone} radius="control" />
                  <Label>tone-{tone}</Label>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Block>

      <Block title="Typography">
        <p className="mb-8 max-w-2xl text-small text-muted">
          Fraunces (soft, weight 650) for headings and voice labels, always in Title Case. Geist for
          UI and body copy. Prices lead product cards in semibold sans.
        </p>
        <ul className="flex flex-col gap-7">
          {typeScale.map((item) => (
            <li key={item.token} className="grid gap-2 md:grid-cols-[10rem_1fr] md:items-baseline">
              <Label>{item.token}</Label>
              <span className={item.className}>{item.sample}</span>
            </li>
          ))}
        </ul>
      </Block>

      <Block title="Buttons">
        <div className="flex flex-col gap-8">
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary">Buy Now</Button>
            <Button variant="secondary">Add to Cart</Button>
            <Button variant="outline" shape="pill">See More Collections</Button>
            <Button variant="ghost">Text Action</Button>
            <Button variant="primary" disabled>Disabled</Button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
            <Button variant="secondary" size="icon" aria-label="Add to wishlist"><HeartIcon /></Button>
          </div>
          <div className="flex flex-wrap items-center gap-3 rounded-card bg-ink p-6">
            <Button variant="cream">Shop Now</Button>
            <Button variant="cream" shape="pill">View All</Button>
            <Button variant="dark" size="icon" aria-label="Previous" className="ring-1 ring-cream/20"><ArrowLeftIcon /></Button>
            <Button variant="dark" size="icon" aria-label="Next" className="ring-1 ring-cream/20"><ArrowRightIcon /></Button>
            <Button variant="ghost" className="text-cream">Ghost on Dark</Button>
          </div>
          <div className="max-w-sm">
            <Button fullWidth>Full Width</Button>
          </div>
        </div>
      </Block>

      <Block title="Links, Tags & Fields">
        <div className="flex flex-col gap-8">
          <p className="flex flex-wrap gap-8 text-small font-medium">
            <TextLink href="#">Navigation Link</TextLink>
            <TextLink href="#">Another Link</TextLink>
          </p>
          <p className="max-w-xl">
            Body copy with an <TextLink href="#" underline="inline">inline link</TextLink> that stays
            underlined for clarity.
          </p>
          <div className="flex flex-wrap gap-2">
            <Tag>Men&apos;s Shoes</Tag>
            <Tag>Women&apos;s Sandals</Tag>
            <Tag>Bags</Tag>
          </div>
          <div className="flex max-w-md flex-col gap-3 sm:flex-row">
            <label htmlFor="ds-email" className="sr-only">Email address</label>
            <input id="ds-email" type="email" placeholder="Email address" className="field" />
            <Button className="shrink-0">Submit</Button>
          </div>
          <div className="max-w-md rounded-card bg-ink p-6">
            <div className="relative">
              <label htmlFor="ds-email-dark" className="sr-only">Email address</label>
              <MailIcon aria-hidden width={18} height={18} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-cream/60" />
              <input id="ds-email-dark" type="email" placeholder="Enter your email address" className="field-dark h-12 pr-32 pl-11" />
              <Button variant="cream" size="sm" className="absolute top-1 right-1 h-10">Subscribe</Button>
            </div>
          </div>
        </div>
      </Block>

      <Block title="Radius, Wells & Containers">
        <div className="flex flex-col gap-8">
          <ul className="grid max-w-2xl grid-cols-3 gap-4">
            <li><div className="well aspect-square" /><Label>rounded-card · 14px</Label></li>
            <li><div className="aspect-square rounded-control bg-secondary" /><Label>rounded-control · 8px</Label></li>
            <li><div className="flex aspect-square items-center"><div className="h-12 w-full rounded-pill bg-tag" /></div><Label>rounded-pill</Label></li>
          </ul>
          <div className="rounded-control bg-surface py-4 text-center text-small">
            container-page · max 1280px + fluid gutter (16 → 48px)
          </div>
        </div>
      </Block>
      <div className="container-narrow pb-8">
        <div className="rounded-control bg-surface py-4 text-center text-small">container-narrow · max 720px</div>
      </div>

      <Block title="Product Card">
        <ProductGrid>
          {sample.map((product) => (
            <li key={product.slug}>
              <ProductCard
                href={productHref(product.slug)}
                name={product.name}
                summary={product.summary}
                tag={product.tag}
                price={formatPrice(product.price)}
                compareAtPrice={product.compareAtPrice ? formatPrice(product.compareAtPrice) : undefined}
                badge={product.badge}
                image={product.image}
              />
            </li>
          ))}
        </ProductGrid>
      </Block>
    </main>
  );
}
