/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "placehold.co" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "cdn.simpleicons.org" },
    ],
  },
  // Proxies /api/* to the real backend so the browser only ever talks to this one origin.
  // Without this, with the API (Render) and frontend (Vercel) on unrelated domains, a cookie
  // set by one is never sent to the other by the browser — every server-side session check
  // (the /admin and /cuenta guards, which read cookies() and forward them to the backend from
  // Next's server) silently sees no cookie at all and treats the visitor as logged out, even
  // right after a successful login. Client-side fetches (credentials: "include") don't hit this,
  // since those go straight from the browser to whichever origin NEXT_PUBLIC_API_URL points at —
  // this only matters once NEXT_PUBLIC_API_URL is switched to point at this same frontend
  // origin's /api instead of the backend directly, which is what actually fixes the cookie issue;
  // this rewrite is what makes that redirected traffic still reach the real backend.
  // BACKEND_API_URL is server-only (no NEXT_PUBLIC_ prefix — never shipped to the browser,
  // this only runs during the rewrite itself) and is a no-op locally, where it's unset.
  async rewrites() {
    const backendUrl = process.env.BACKEND_API_URL;
    if (!backendUrl) return [];
    return [{ source: "/api/:path*", destination: `${backendUrl}/:path*` }];
  },
};

export default nextConfig;
