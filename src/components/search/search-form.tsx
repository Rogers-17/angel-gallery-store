import { SearchIcon } from "@/components/layout/icons";
import { Button } from "@/components/ui/button";

/** GET form to /search: works without JavaScript. */
export function SearchForm({ defaultValue, autoFocus }: { defaultValue?: string; autoFocus?: boolean }) {
  return (
    <form action="/search" method="get" role="search" className="flex w-full max-w-xl gap-2">
      <label htmlFor="search-query" className="sr-only">Search products</label>
      <div className="relative flex-1">
        <SearchIcon
          aria-hidden
          width={18}
          height={18}
          className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted"
        />
        <input
          id="search-query"
          name="q"
          type="search"
          defaultValue={defaultValue}
          placeholder="Search shoes, bags, clothing…"
          maxLength={80}
          autoFocus={autoFocus}
          autoComplete="off"
          className="field pl-10"
        />
      </div>
      <Button type="submit" variant="primary" className="shrink-0">Search</Button>
    </form>
  );
}
