# Flashkings Web

Frontend del e-commerce Flashkings (periféricos gaming, Perú). Next.js 14 (App Router) + Tailwind CSS + Zustand + TanStack Query + Framer Motion.

Consume la API de [`flashkings-service`](https://github.com/Neutroflash/flashkings-service) — las reglas de negocio (reserva de stock, pagos, RBAC) viven allí, no en este repo.

## Documentación

- [Estado de implementación](./docs/IMPLEMENTATION_STATUS.md) — páginas, componentes, diseño, pendientes

## Quick start

```bash
bun install
cp .env.local.example .env.local
bun run dev   # http://localhost:3000
```

Requiere el backend corriendo en `NEXT_PUBLIC_API_URL` (default `http://localhost:4000/api`).

Credenciales de prueba (tras el seed del backend): `admin@flashkings.pe` / `Admin123!` en `/login`.
