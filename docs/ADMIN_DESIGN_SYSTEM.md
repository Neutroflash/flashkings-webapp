# Sistema de Diseño — Panel Admin

Documenta el lenguaje visual y los patrones de componentes ya construidos en `/admin/*`, para poder replicarlo con consistencia (nuevas secciones del mismo panel, u otro panel derivado de este — ver la nota sobre reutilización al final).

Filosofía explícita: **denso en datos, sin animación**. El storefront público usa Framer Motion (Hero, transiciones de catálogo); el admin deliberadamente no — un panel que se usa muchas veces al día se beneficia de sentirse rápido y estable, no "vistoso". Ningún componente en `components/admin/` debe importar `framer-motion`.

## Paleta

Tema oscuro cyberpunk/gaming, heredado del storefront pero aplicado con más sobriedad:

| Token | Uso |
|---|---|
| `bg-zinc-900/60` + `backdrop-blur-md` | Fondo de tarjetas y contenedores principales (glassmorphism) |
| `border-zinc-800/80` | Borde de tarjetas, filas, separadores |
| `bg-black/40` / `bg-black/30` | Fondo de inputs, filas alternas |
| `text-zinc-100` | Texto principal |
| `text-zinc-400` | Texto secundario / labels de nav inactivos |
| `text-zinc-500` | Texto terciario / placeholders / metadatos |
| `text-yellow-400` | Acento primario — estado activo, valores destacados, precios, links |
| `border-yellow-500/50` | Borde de foco en inputs |
| `bg-yellow-400/10` | Fondo de ítem de navegación activo |
| `text-emerald-400` | Éxito (badge "Entregado", "Respondido", mensajes de guardado) |
| `text-red-400` | Destructivo — siempre como *hover state*, nunca color base (ver Interacciones) |
| `text-cyan-*` | No se usa en admin — el cian es exclusivo del storefront público |

## Componentes base

**Tarjeta / contenedor**: `rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-5 backdrop-blur-md`

**Input de texto/select**: `h-9 rounded-lg border border-white/10 bg-black/30 px-2 text-sm text-zinc-100 outline-none transition-colors focus:border-yellow-500/50` (`h-10` en formularios de página completa como login/registro, `h-9` dentro de modales/tablas más densas)

**Tabla**: contenedor `overflow-x-auto rounded-2xl border border-zinc-800/80 bg-zinc-900/60 backdrop-blur-md`; encabezado `bg-white/[0.03] text-xs uppercase tracking-wide text-zinc-400`; filas `border-b border-zinc-800/60 transition-colors hover:bg-white/[0.03]`. El `overflow-x-auto` es obligatorio — es la estrategia de responsive del admin (scroll horizontal en vez de recolapsar columnas).

**Modal** (Radix Dialog): `Overlay` en `bg-black/70`; `Content` en `rounded-2xl border border-zinc-800/80 bg-zinc-900 p-6 shadow-2xl`, ancho `w-[calc(100%-2rem)] max-w-lg` (`max-w-md` para formularios más cortos) — el `calc(100%-2rem)` es lo que evita que el modal toque los bordes en mobile.

**Badge de estado**: mapa `Record<Status, Variant>` explícito por dominio (ver `OrdersTable`/`MyOrdersList`/`ComplaintsTable`) — nunca un color calculado dinámicamente. Reservados: `success` (verde) para estados terminales positivos, `destructive` (rojo) para cancelado/vencido, `outline` para pendiente, `secondary`/`default` para estados intermedios.

## Patrones de interacción

- **Filas de campos que se apilan en mobile**: `flex flex-col gap-2 sm:flex-row` — nunca `flex` a secas en un formulario con 2+ inputs lado a lado (ver el fix de responsive de esta misma sesión).
- **Headers `título + acción`**: siempre `flex flex-wrap items-center justify-between gap-3`, nunca sin `flex-wrap` — es la red de seguridad si el contenido crece.
- **Botones destructivos**: el color rojo aparece solo en `hover:text-red-400`, el estado base es `text-zinc-400`/`text-zinc-500` — un botón de eliminar no debe gritar hasta que el usuario lo va a tocar.
- **Guard de acceso**: Server Component en el nivel de página/layout (`getCurrentUser()` vía `next/headers`), nunca client-side — evita el flash de contenido protegido. El *enforcement* real vive siempre en el backend (`requireRole("ADMIN")`); el guard del frontend es solo UX de redirección.
- **Mutaciones**: patrón `useState` local para `submitting`/`error` + `router.refresh()` tras éxito (no un store global) — cada modal/formulario es dueño de su propio estado de carga.

## Reutilización para otro cliente/producto

La pregunta de fondo (¿puede este panel reutilizarse para varios clientes?) tiene una respuesta de arquitectura, no de estilo — este documento cubre solo el *look*. La parte de negocio (multi-tenancy, aislamiento de datos por cliente) se conversó aparte y no está resuelta ni implementada todavía; si se retoma, documentar la decisión de aislamiento (columna `storeId` vs. esquema separado vs. base separada) en un archivo propio, no acá.
