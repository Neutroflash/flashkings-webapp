import Image from "next/image";
import { cn } from "@/lib/utils";

// Hex values (without '#') for cdn.simpleicons.org's color param — Tailwind's zinc-500/amber-400,
// matched exactly so the crossfade below lines up with the rest of the site's hover palette.
const GRAY = "71717a";
const GOLD = "fbbf24";

interface IconBrand {
  kind: "icon";
  name: string;
  slug: string;
}

interface TextBrand {
  kind: "text";
  name: string;
}

type Brand = IconBrand | TextBrand;

// Not every brand has a logo published in simple-icons (Logitech and Glorious don't, as of
// checking cdn.simpleicons.org directly) — those fall back to a stylized wordmark instead of a
// broken image.
const BRANDS: Brand[] = [
  { kind: "text", name: "Logitech G" },
  { kind: "icon", name: "Razer", slug: "razer" },
  { kind: "icon", name: "HyperX", slug: "hyperx" },
  { kind: "icon", name: "SteelSeries", slug: "steelseries" },
  { kind: "text", name: "Glorious" },
  { kind: "icon", name: "Asus ROG", slug: "asus" },
  { kind: "text", name: "MCHOSE" },
  { kind: "text", name: "VGN" },
  { kind: "text", name: "AULA" },
];

function BrandLogo({ brand }: { brand: Brand }) {
  if (brand.kind === "text") {
    return (
      <span className="text-xl font-black uppercase tracking-widest text-zinc-500 transition-colors duration-300 hover:text-amber-400">
        {brand.name}
      </span>
    );
  }

  return (
    <span className="relative block h-8 w-28 shrink-0" title={brand.name}>
      <Image
        src={`https://cdn.simpleicons.org/${brand.slug}/${GRAY}`}
        alt={brand.name}
        fill
        unoptimized
        className="object-contain opacity-100 transition-opacity duration-300 group-hover/logo:opacity-0"
      />
      <Image
        src={`https://cdn.simpleicons.org/${brand.slug}/${GOLD}`}
        alt=""
        aria-hidden
        fill
        unoptimized
        className="object-contain opacity-0 transition-opacity duration-300 group-hover/logo:opacity-100"
      />
    </span>
  );
}

// Server Component: the pause-on-hover and gray->gold crossfade are pure CSS (group-hover),
// no client-side state needed.
export function BrandMarquee() {
  const track = [...BRANDS, ...BRANDS];

  return (
    <div className="group relative overflow-hidden border-y border-zinc-800/50 bg-black/30 py-8 backdrop-blur-sm">
      <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-background to-transparent" />
      <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-background to-transparent" />

      <div className="flex w-max animate-marquee gap-16 group-hover:[animation-play-state:paused]">
        {track.map((brand, i) => (
          <div key={`${brand.name}-${i}`} className={cn("group/logo flex shrink-0 items-center justify-center")}>
            <BrandLogo brand={brand} />
          </div>
        ))}
      </div>
    </div>
  );
}
