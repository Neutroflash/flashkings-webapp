import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { CartHydration } from "@/components/providers/CartHydration";
import { CartDrawer } from "@/components/cart/CartDrawer";

const inter = Inter({ subsets: ["latin"] });

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://flashkings.pe";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Flashkings Perú | Periféricos Gaming de Alto Rendimiento",
    template: "%s | Flashkings Perú",
  },
  description:
    "Teclados mecánicos, mouses de precisión, mousepads y accesorios gaming en Perú. Envíos a todo el país.",
  openGraph: {
    siteName: "Flashkings Perú",
    locale: "es_PE",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="dark">
      <body className={inter.className}>
        <QueryProvider>
          {/* Preloaded site-wide (not just on /checkout) so it has a head start over the multi-
              hundred-KB third-party bundle by the time the customer reaches checkout and clicks
              "Iniciar Pago" — mounting it only on the checkout page raced the order-creation
              request on a first visit (fast local API call vs. a cold third-party download),
              which is exactly why refreshing "fixed" it: the browser had it cached by then. */}
          <Script src="https://checkout.culqi.com/js/v4" strategy="afterInteractive" />
          <CartHydration />
          <Navbar />
          <main className="mx-auto min-h-screen max-w-7xl px-4 py-8 print:max-w-none print:p-0">{children}</main>
          <Footer />
          <CartDrawer />
          <WhatsAppButton />
        </QueryProvider>
      </body>
    </html>
  );
}
