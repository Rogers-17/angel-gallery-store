import { WhatsAppIcon } from "@/components/layout/icons";
import { buttonClasses } from "@/components/ui/button";
import { cn } from "@/lib/cn";

/** The main hand-off: a plain wa.me link from the buyer to the admin, pre-filled with the order. */
export function WhatsAppButton({ href, className }: { href: string; className?: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(buttonClasses({ variant: "primary", size: "lg" }), className)}
    >
      <WhatsAppIcon />
      Send order on WhatsApp
    </a>
  );
}
