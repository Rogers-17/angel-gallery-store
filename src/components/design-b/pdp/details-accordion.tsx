import type { ReactNode } from "react";

/** Native <details> accordion: keyboard accessible, no JS. */
export function DetailsAccordion({ items }: { items: { title: string; content: ReactNode; open?: boolean }[] }) {
  return (
    <div className="hairline border-t">
      {items.map((item) => (
        <details key={item.title} open={item.open} className="group hairline border-b">
          <summary className="flex cursor-pointer list-none items-center justify-between py-5 text-body font-medium [&::-webkit-details-marker]:hidden">
            {item.title}
            <span aria-hidden className="text-h4 leading-none transition-transform duration-300 group-open:rotate-45">+</span>
          </summary>
          <div className="pb-6 text-small text-ink-soft">{item.content}</div>
        </details>
      ))}
    </div>
  );
}
