import Link from "next/link";
import { Category } from "@/types/product";
import { cn } from "@/lib/utils";

export function CategoryFilter({
  categories,
  activeSlug,
}: {
  categories: Category[];
  activeSlug?: string;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <Link
        href="/catalogo"
        className={cn(
          "rounded-full border border-border px-4 py-1.5 text-sm transition-colors hover:border-primary",
          !activeSlug && "border-primary bg-primary text-primary-foreground",
        )}
      >
        Todos
      </Link>
      {categories.map((category) => (
        <Link
          key={category.id}
          href={`/catalogo?category=${category.slug}`}
          className={cn(
            "rounded-full border border-border px-4 py-1.5 text-sm transition-colors hover:border-primary",
            activeSlug === category.slug && "border-primary bg-primary text-primary-foreground",
          )}
        >
          {category.name}
        </Link>
      ))}
    </div>
  );
}
