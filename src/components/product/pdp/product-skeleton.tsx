import { Container } from "@/components/ui/container";

const block = "animate-pulse rounded-control bg-surface";

/** Placeholder with the product page's layout, shown while a product streams in. */
export function ProductSkeleton() {
  return (
    <main className="flex-1">
      <Container className="pt-8 pb-section-sm" aria-busy="true" aria-label="Loading product">
        <div className={`${block} h-4 w-48`} />
        <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col gap-3">
            <div className="well aspect-square animate-pulse" />
            <div className="grid grid-cols-4 gap-3">
              {Array.from({ length: 4 }, (_, i) => (
                <div key={i} className={`${block} aspect-square`} />
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-6">
            <div className={`${block} h-6 w-28 rounded-pill`} />
            <div className={`${block} h-12 w-4/5`} />
            <div className={`${block} h-5 w-full`} />
            <div className={`${block} h-9 w-36`} />
            <div className="flex gap-3">
              <div className={`${block} h-9 w-28 rounded-pill`} />
              <div className={`${block} h-9 w-28 rounded-pill`} />
            </div>
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
              {Array.from({ length: 10 }, (_, i) => (
                <div key={i} className={`${block} h-11`} />
              ))}
            </div>
            <div className={`${block} h-13`} />
          </div>
        </div>
      </Container>
    </main>
  );
}
