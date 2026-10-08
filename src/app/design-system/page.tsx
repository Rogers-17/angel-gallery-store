import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Eyebrow, Heading } from "@/components/ui/heading";
import { Media, type MediaTone } from "@/components/ui/media";
import { Section } from "@/components/ui/section";
import { TextLink } from "@/components/ui/text-link";

export const metadata: Metadata = { title: "Design system · Angel Gallery Store" };

const typeScale = [
  { token: "text-display", className: "font-serif text-display", sample: "Display" },
  { token: "text-h1", className: "font-serif text-h1", sample: "Heading one" },
  { token: "text-h2", className: "font-serif text-h2", sample: "Heading two" },
  { token: "text-h3", className: "font-serif text-h3", sample: "Heading three" },
  { token: "text-h4", className: "font-serif text-h4", sample: "Heading four" },
  { token: "text-body-lg", className: "text-body-lg", sample: "Large body for introductions and editorial copy." },
  { token: "text-body", className: "text-body", sample: "Body text for descriptions, forms and general UI." },
  { token: "text-small", className: "text-small", sample: "Small text for product names, prices and meta." },
  { token: "eyebrow", className: "eyebrow", sample: "Label / eyebrow" },
];

// Literal class names so Tailwind generates them.
const colors = [
  { name: "paper", swatch: "bg-paper" },
  { name: "surface", swatch: "bg-surface" },
  { name: "surface-strong", swatch: "bg-surface-strong" },
  { name: "line", swatch: "bg-line" },
  { name: "line-strong", swatch: "bg-line-strong" },
  { name: "muted", swatch: "bg-muted" },
  { name: "ink-soft", swatch: "bg-ink-soft" },
  { name: "ink", swatch: "bg-ink" },
  { name: "accent", swatch: "bg-accent" },
  { name: "success", swatch: "bg-success" },
  { name: "danger", swatch: "bg-danger" },
];

const tones: MediaTone[] = ["sand", "stone", "clay", "sage", "mist", "umber"];

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Section spacing="sm" divider>
      <Container>
        <Eyebrow className="mb-8">{title}</Eyebrow>
        {children}
      </Container>
    </Section>
  );
}

export default function DesignSystemPage() {
  return (
    <main className="flex-1">
      <Section spacing="sm">
        <Container>
          <Eyebrow>Reference</Eyebrow>
          <Heading as="h1" size="h1" className="mt-4">Design system</Heading>
          <p className="mt-4 max-w-xl text-muted">
            Tokens live in <code className="font-mono text-small">src/styles/theme.css</code>,
            primitives in <code className="font-mono text-small">src/styles/components.css</code> and{" "}
            <code className="font-mono text-small">src/components/ui</code>.
          </p>
        </Container>
      </Section>

      <Block title="Type scale">
        <ul className="flex flex-col gap-8">
          {typeScale.map((item) => (
            <li key={item.token} className="grid gap-2 md:grid-cols-[12rem_1fr] md:items-baseline">
              <code className="font-mono text-small text-muted">{item.token}</code>
              <span className={item.className}>{item.sample}</span>
            </li>
          ))}
        </ul>
      </Block>

      <Block title="Color">
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
          {colors.map((color) => (
            <li key={color.name}>
              <div className={`hairline aspect-square border ${color.swatch}`} />
              <code className="mt-2 block font-mono text-small text-muted">{color.name}</code>
            </li>
          ))}
        </ul>
        <ul className="mt-10 grid grid-cols-3 gap-4 sm:grid-cols-6">
          {tones.map((tone) => (
            <li key={tone}>
              <Media ratio="4/5" tone={tone} />
              <code className="mt-2 block font-mono text-small text-muted">tone-{tone}</code>
            </li>
          ))}
        </ul>
      </Block>

      <Block title="Buttons">
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center gap-4">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="primary" disabled>Disabled</Button>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
          </div>
          <div className="flex flex-wrap items-center gap-4 bg-ink p-6">
            <Button variant="inverse">Inverse</Button>
            <Button variant="ghost" className="text-paper">Ghost on dark</Button>
          </div>
          <div className="max-w-sm">
            <Button fullWidth>Full width</Button>
          </div>
        </div>
      </Block>

      <Block title="Links and fields">
        <div className="flex flex-col gap-8">
          <p className="flex flex-wrap gap-8">
            <TextLink href="#">Hover underline</TextLink>
            <TextLink href="#" className="eyebrow">Label link</TextLink>
          </p>
          <p className="max-w-xl">
            Body copy with an <TextLink href="#" underline="inline">inline link</TextLink> that
            stays underlined for clarity.
          </p>
          <div className="flex max-w-md flex-col gap-3 sm:flex-row">
            <label htmlFor="ds-email" className="sr-only">Email</label>
            <input id="ds-email" type="email" placeholder="Email address" className="field" />
            <Button className="shrink-0">Submit</Button>
          </div>
        </div>
      </Block>

      <Block title="Containers">
        <div className="flex flex-col gap-4 text-small">
          <div className="bg-surface py-4 text-center">container-page · max 1440px + fluid gutter</div>
        </div>
      </Block>
      <div className="container-narrow pb-section-sm">
        <div className="bg-surface py-4 text-center text-small">container-narrow · max 720px</div>
      </div>
    </main>
  );
}
