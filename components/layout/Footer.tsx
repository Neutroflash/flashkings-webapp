import Link from "next/link";
import { getCategories } from "@/lib/api";

const PAYMENT_METHODS = ["Yape", "Plin", "Visa", "Mastercard"];

// Server Component: categories share the same ISR cache as CategoryFilter (lib/api.ts), no extra request cost.
export async function Footer() {
  const categories = await getCategories();

  return (
    <footer className="mt-24 border-t border-zinc-800/80 bg-black/40">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-3">
          <span className="text-xl font-black tracking-tight">
            FLASH<span className="text-gradient-gold">KINGS</span>
          </span>
          <p className="text-sm text-zinc-400">
            Periféricos gaming de alto rendimiento para jugadores competitivos en Perú. Teclados mecánicos, mouses de
            precisión y mousepads seleccionados para la comunidad eSports.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-yellow-400/80">Atención al Cliente</h3>
          <ul className="flex flex-col gap-2 text-sm text-zinc-400">
            <li>Envíos a todo el Perú vía Olva Courier y Shalom</li>
            <li>
              <Link href="/terminos-y-condiciones" className="hover:text-yellow-400">
                Términos y Condiciones
              </Link>
            </li>
            <li>
              <Link href="/politica-de-privacidad" className="hover:text-yellow-400">
                Política de Privacidad
              </Link>
            </li>
            <li>
              <Link href="/libro-de-reclamaciones" className="hover:text-yellow-400">
                Libro de Reclamaciones
              </Link>
            </li>
          </ul>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-yellow-400/80">Categorías</h3>
          <ul className="flex flex-col gap-2 text-sm text-zinc-400">
            {categories.length > 0 ? (
              categories.map((category) => (
                <li key={category.id}>
                  <Link href={`/catalogo?category=${category.slug}`} className="hover:text-yellow-400">
                    {category.name}
                  </Link>
                </li>
              ))
            ) : (
              <li>
                <Link href="/catalogo" className="hover:text-yellow-400">
                  Ver catálogo
                </Link>
              </li>
            )}
          </ul>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-yellow-400/80">Métodos de Pago</h3>
          <div className="flex flex-wrap gap-2">
            {PAYMENT_METHODS.map((method) => (
              <span
                key={method}
                className="rounded-md border border-zinc-800/80 bg-zinc-900/60 px-2.5 py-1 text-xs font-medium text-zinc-300"
              >
                {method}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-zinc-800/80 py-4 text-center text-xs text-zinc-600">
        © {new Date().getFullYear()} Flashkings Perú. Todos los derechos reservados.
      </div>
    </footer>
  );
}
