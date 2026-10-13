import Link from "next/link";
import { SearchForm } from "@/components/search/search-form";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Heading } from "@/components/ui/heading";

const shortcuts = [
  { label: "Shoes", href: "/shop/shoes" },
  { label: "Bags", href: "/shop/bags" },
  { label: "Clothing", href: "/shop/clothing" },
  { label: "New Arrivals", href: "/collections/new-arrivals" },
];

export default function NotFound() {
  return (
    <main className="flex-1">
      <Container className="flex flex-col items-center py-section text-center">
        <p className="text-small font-medium text-primary">404</p>
        <Heading as="h1" size="h1" className="mt-3">We Couldn&apos;t Find That Page</Heading>
        <p className="mt-4 max-w-md text-body text-muted">
          The link may be old or mistyped. Try a search, or pick up where most people start.
        </p>
        <div className="mt-8 flex w-full justify-center">
          <SearchForm />
        </div>
        <ul className="mt-8 flex flex-wrap justify-center gap-2">
          {shortcuts.map((s) => (
            <li key={s.href}>
              <Link href={s.href} className="btn btn-outline btn-sm btn-pill">{s.label}</Link>
            </li>
          ))}
        </ul>
        <ButtonLink href="/" variant="primary" className="mt-10">Back To Home</ButtonLink>
      </Container>
    </main>
  );
}
