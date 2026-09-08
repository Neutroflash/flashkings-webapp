/**
 * Dos URLs distintas para la misma API, porque el navegador y el servidor de Next tienen
 * restricciones opuestas.
 *
 * ## Por qué no puede ser una sola
 *
 * Con una única `NEXT_PUBLIC_API_URL` absoluta (p. ej. `https://flashkings-webapp.vercel.app/api`)
 * el navegador llama SIEMPRE a ese host, venga de donde venga la página. En el dominio de
 * producción coincide y funciona; en cualquier otro deployment de Vercel —el de `main`, el de un
 * PR, cualquier preview, todos con host generado— la llamada pasa a ser cross-origin y el
 * navegador la bloquea:
 *
 *   Access to fetch at 'https://flashkings-webapp.vercel.app/api/auth/me'
 *   from origin 'https://flashkings-webapp-git-main-....vercel.app' has been blocked by CORS
 *
 * Agregar esos hosts al allowlist del backend no es una salida: Vercel genera una URL nueva por
 * rama y por commit, así que la lista nunca estaría completa. La salida es que la llamada del
 * navegador nunca sea cross-origin.
 *
 * ## La regla
 *
 * - **Navegador → ruta relativa** (`/api`). Siempre el mismo origen desde el que se sirvió la
 *   página, sea producción o preview, así que no hay CORS que resolver. El `rewrites()` de
 *   next.config.mjs la reenvía al backend real. Es además lo que hace que las cookies funcionen:
 *   una cookie puesta por el backend en otro dominio no viaja de vuelta.
 * - **Servidor → URL absoluta**, porque `fetch` en Node no tiene un origen contra el cual
 *   resolver una ruta relativa. Va DIRECTO al backend (`BACKEND_API_URL`), sin dar la vuelta por
 *   el propio rewrite del frontend: un salto menos, y no depende de que el deployment sepa su
 *   propio host. Los módulos server-only ya reenvían la cookie a mano (`cookies().toString()`),
 *   así que no pierden la sesión por ir directo.
 *
 * ## Cómo configurarlo
 *
 * Local (`.env.local`): `NEXT_PUBLIC_API_URL=http://localhost:4000/api` y `BACKEND_API_URL` sin
 * definir. El backend local ya tiene `http://localhost:3000` en su allowlist de CORS, así que la
 * llamada absoluta funciona sin proxy.
 *
 * Vercel: `NEXT_PUBLIC_API_URL=/api` y `BACKEND_API_URL=https://<tu-api>.onrender.com/api`.
 */

/** Para código que corre en el navegador. Relativa en producción; absoluta en local. */
export const CLIENT_API_URL = process.env.NEXT_PUBLIC_API_URL ?? "/api";

/**
 * Para código que corre en el servidor de Next (Server Components, route handlers). Prefiere el
 * backend directo; cae a la pública solo cuando esta es absoluta, que es el caso de desarrollo.
 */
export const SERVER_API_URL = resolveServerApiUrl();

function resolveServerApiUrl(): string {
  const backend = process.env.BACKEND_API_URL;
  if (backend) return backend.replace(/\/$/, "");

  const publicUrl = process.env.NEXT_PUBLIC_API_URL;
  // Una relativa acá sería un fetch inválido en Node. Es exactamente lo que pasa si se configura
  // NEXT_PUBLIC_API_URL=/api en Vercel y se olvida BACKEND_API_URL, así que conviene que falle
  // diciendo qué falta en vez de con un "Failed to parse URL" a mitad de un render.
  if (publicUrl && !publicUrl.startsWith("/")) return publicUrl.replace(/\/$/, "");
  if (publicUrl) {
    throw new Error(
      `NEXT_PUBLIC_API_URL es relativa ("${publicUrl}"), que sirve para el navegador pero no para el servidor. ` +
        "Define BACKEND_API_URL con la URL absoluta del backend (p. ej. https://tu-api.onrender.com/api).",
    );
  }

  return "http://localhost:4000/api";
}
