import type { Metadata } from "next";
import { Inter } from "next/font/google";
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
          <CartHydration />
          <Navbar />
          <main className="mx-auto min-h-screen max-w-7xl px-4 py-8">{children}</main>
          <Footer />
          <CartDrawer />
          <WhatsAppButton />
        </QueryProvider>
      </body>
    </html>
  );
}
