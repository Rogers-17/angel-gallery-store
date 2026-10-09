import { ButtonLink } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Media, type MediaTone } from "@/components/ui/media";

type CtaBannerProps = {
  id?: string;
  title: string;
  cta: string;
  href: string;
  tone: MediaTone;
  image: { src: string; alt: string; position?: string };
};

/** Rounded full-width photo banner with a centered heading and button. */
export function CtaBanner({ id, title, cta, href, tone, image }: CtaBannerProps) {
  return (
    <div className="relative overflow-hidden rounded-card">
      <Media
        ratio="4/5"
        tone={tone}
        src={image.src}
        alt={image.alt}
        objectPosition={image.position}
        sizes="100vw"
        className="sm:aspect-video lg:aspect-21/9"
      />
      <div className="absolute inset-0 bg-ink/55" />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-8 px-6 text-center text-inverse">
        <Heading id={id} size="h1" className="max-w-3xl">{title}</Heading>
        <ButtonLink href={href} variant="inverse" size="md" shape="pill">
          {cta}
        </ButtonLink>
      </div>
    </div>
  );
}
