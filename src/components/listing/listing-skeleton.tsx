const block = "animate-pulse rounded-control bg-surface";

/** Grid placeholder while request-time results stream in. */
export function ResultsSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div aria-busy="true" aria-label="Loading products" className="lg:grid lg:grid-cols-[15rem_1fr] lg:gap-10">
      <div className="hidden flex-col gap-4 lg:flex">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className={`${block} h-24`} />
        ))}
      </div>
      <div>
        <div className="mb-6 flex items-center justify-between">
          <div className={`${block} h-5 w-40`} />
          <div className={`${block} h-10 w-40 rounded-pill`} />
        </div>
        <ul className="grid grid-cols-2 gap-x-4 gap-y-12 lg:grid-cols-3 lg:gap-x-6">
          {Array.from({ length: count }, (_, i) => (
            <li key={i} className="flex flex-col gap-3">
              <div className="well aspect-square animate-pulse" />
              <div className={`${block} h-6 w-24`} />
              <div className={`${block} h-4 w-3/4`} />
              <div className={`${block} h-10`} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/** Page header placeholder (breadcrumb + title). */
export function HeaderSkeleton() {
  return (
    <div className="flex flex-col gap-4 pb-10">
      <div className={`${block} h-4 w-40`} />
      <div className={`${block} h-12 w-72`} />
      <div className={`${block} h-4 w-96 max-w-full`} />
    </div>
  );
}
