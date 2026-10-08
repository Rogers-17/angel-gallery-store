import { TextLink } from "@/components/ui/text-link";
import { footerNav } from "./nav";

export function SiteFooter() {
  return (
    <footer className="hairline mt-auto border-t">
      <div className="container-page grid grid-cols-2 gap-x-6 gap-y-10 py-16 md:grid-cols-4">
        {footerNav.map((group) => (
          <div key={group.title}>
            <h2 className="eyebrow mb-5 font-sans text-muted">{group.title}</h2>
            <ul className="flex flex-col gap-3 text-small">
              {group.links.map((link) => (
                <li key={link.label}>
                  <TextLink href={link.href}>{link.label}</TextLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="hairline border-t">
        <div className="container-page flex flex-col gap-3 py-6 text-small text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Angel Gallery</p>
          <ul className="flex gap-6">
            <li><TextLink href="/design-system">Design system</TextLink></li>
            <li><TextLink href="#">Privacy</TextLink></li>
            <li><TextLink href="#">Terms</TextLink></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
