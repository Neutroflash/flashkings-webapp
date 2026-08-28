# Estado de Implementación — Frontend

Next.js 14 (App Router) + Tailwind CSS + Zustand + TanStack Query + Framer Motion, Bun como package manager. Las reglas de negocio que gobiernan lo que este frontend consume viven en el repo del backend ([`flashkings-service/docs/BUSINESS_RULES.md`](https://github.com/Neutroflash/flashkings-service/blob/main/docs/BUSINESS_RULES.md)) — este documento cubre solo la capa de presentación.

Leyenda: ✅ implementado y probado (build + smoke test HTTP) · ⚠️ implementado con una limitación conocida · ❌ no implementado.

## Páginas

| Ruta | Tipo | Estado | Notas |
|---|---|---|---|
| `/` | Server Component (ISR) | ✅ | Hero animado + productos destacados |
| `/catalogo` | Server Component (ISR) | ✅ | Filtro por categoría y búsqueda vía `searchParams` |
| `/producto/[slug]` | Server Component (ISR, `revalidate=3600`) | ✅ | `generateMetadata` dinámico, selección de variante |
| `/checkout` | Client Component | ⚠️ | Flujo completo funcional contra `PAYMENT_GATEWAY=fake` (botón "Pagar modo de prueba"). El widget real de Culqi.js solo se activa si el backend devuelve una `publicKey` — nunca probado contra Culqi real |
| `/pedido/[orderId]/confirmacion` | Server Component | ✅ | |
| `/login` | Client Component | ✅ | Único punto de entrada de autenticación (cliente y admin comparten el mismo formulario) |
| `/admin` | Server Component | ✅ | Redirect a `/admin/orders` |
| `/admin/orders`, `/admin/orders/[orderId]` | Server Component | ✅ | Filtro por estado, transición manual, botón WhatsApp |
| `/admin/inventory` | Server Component + tabla client | ✅ | Edición inline de stock/precio/costo con margen calculado |
| `/sitemap.xml`, `/robots.txt` | Route handlers | ✅ | Dinámicos, incluyen todos los productos/categorías |

## Protección de rutas admin

`app/admin/layout.tsx` es un Server Component que llama a `GET /api/auth/me` reenviando la cookie de sesión (`next/headers`) y redirige a `/login` si no hay un `ADMIN`. **Esto es solo conveniencia de UX** — la aplicación real del permiso vive en el backend (`requireRole('ADMIN')` en cada ruta mutante). Nunca confiar en este guard como única barrera.

## Estado global y datos

- **Carrito** (`store/cart-store.ts`, Zustand + `persist`): ítems y estado del drawer (`isOpen`/`openCart`/`closeCart`). Solo `items` se persiste en `localStorage` — el estado del drawer es transitorio a propósito (`partialize`).
- **Fetching server-side** (`lib/api.ts`, `lib/admin-api.ts`, `lib/orders.ts`): cada Server Component fetch tiene su propia ventana de revalidación ISR documentada inline. `lib/admin-api.ts` es server-only (usa `next/headers`) — las mutaciones que corren en componentes cliente viven separadas en `lib/admin-mutations.ts` para no filtrar ese import al bundle del navegador.
- **TanStack Query**: usado únicamente para mutaciones del panel admin (`useMutation` + `router.refresh()` para re-disparar el fetch del Server Component); no hay `useQuery` sobre datos que ya vienen del servidor.

## Resiliencia de build

`getProducts`/`getCategories`/`getProductBySlug` (`lib/api.ts`) atrapan errores de fetch y devuelven listas vacías / `null` en vez de lanzar. Esto es necesario para que `next build` no falle cuando la API no está disponible en tiempo de build (confirmado con un test explícito: sin este fix, el build fallaba con `exit 1` al no poder resolver `NEXT_PUBLIC_API_URL`). El CI de GitHub Actions hace el build apuntando a una URL de producción que no existe durante el propio CI — depende de este comportamiento.

## Diseño visual ("Cyberpunk / Premium Gaming")

- Fondo `#0a0a0c` con patrón de puntos (`.bg-grid-pattern`, `app/globals.css`), acentos dorado eléctrico (`yellow-400/500`) y cian (`cyan-400`).
- Glassmorphism (`bg-zinc-900/60 backdrop-blur-md border-zinc-800/80`) en `ProductCard`, tablas admin, paneles de detalle.
- Framer Motion: entrada escalonada en `HeroSection` y `CatalogGrid`. **Deliberadamente no usado en el panel admin** — una herramienta de datos se beneficia de sentirse estable, no animada.
- `Navbar` como panel de vidrio flotante (`sticky top-4 rounded-2xl backdrop-blur-xl`).
- Detalle: `lucide-react` está fijado en `^0.451.0` — la v1.x rompe la optimización de imports de paquetes de Next 14 (`__webpack_modules__ is not a function` en runtime). No actualizar sin verificar contra Next 15+.

## Pendientes explícitos

1. **Widget Culqi.js real**: el flujo de pago está armado para cargarlo (`app/checkout/page.tsx`), pero nunca se probó con una `publicKey` real — depende de que el backend tenga `PAYMENT_GATEWAY=culqi` configurado con credenciales.
2. **Verificación visual del rediseño**: todo se validó por `tsc`/`next build`/smoke tests HTTP. No hay confirmación visual en navegador (la extensión de Chrome no está instalada en esta sesión) — revisar manualmente antes de considerar el rediseño "cerrado".
3. **Página `/carrito` standalone**: no existe — el drawer reemplaza esa necesidad. Si se necesita una URL compartible del carrito, falta construirla.

## Quick start

```bash
bun install
cp .env.local.example .env.local
bun run dev   # http://localhost:3000, requiere el backend corriendo en :4000
```
