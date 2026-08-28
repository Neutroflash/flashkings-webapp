"use client";

import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { ArrowRight } from "lucide-react";

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

export function HeroSection() {
  return (
    <section className="relative flex flex-col items-center gap-6 overflow-hidden py-12 text-center sm:py-16">
      {/* Diffused light glows behind the headline — gold dominant, a faint cyan echo for "speed" */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-yellow-500/10 blur-[120px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-[65%] top-[30%] -z-10 h-[280px] w-[280px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400/10 blur-[100px]"
      />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="flex flex-col items-center gap-6"
      >
        <motion.span
          variants={item}
          className="rounded-full border border-yellow-500/30 bg-yellow-500/5 px-4 py-1 text-xs font-medium uppercase tracking-widest text-yellow-400"
        >
          Envíos a todo el Perú
        </motion.span>

        <motion.h1
          variants={item}
          className="max-w-3xl text-5xl font-black uppercase tracking-tight sm:text-6xl lg:text-7xl"
        >
          Domina el juego con{" "}
          <span className="text-gradient-gold">periféricos de alto rendimiento</span>
        </motion.h1>

        <motion.p variants={item} className="max-w-xl text-balance text-muted-foreground sm:text-lg">
          Teclados mecánicos, mouses de precisión y mousepads gaming, seleccionados para jugadores competitivos.
        </motion.p>

        <motion.div variants={item}>
          <Link
            href="/catalogo"
            className="btn-shimmer group relative inline-flex animate-glow-pulse items-center gap-2 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-500 px-8 py-3.5 text-sm font-bold uppercase tracking-wide text-black transition-transform hover:scale-[1.03] active:scale-[0.98]"
          >
            Ver catálogo
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}
