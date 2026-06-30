"use client";

import Link from "next/link";
import Image from "next/image";

export default function MobileBlocker() {
  return (
    <div className="min-h-screen bg-saf-dark flex items-center justify-center px-6">
      <div className="text-center max-w-sm">
        <Image
          src="/logo.png"
          alt="Squad AllStars France"
          width={80}
          height={53}
          className="mx-auto mb-8 opacity-50"
        />
        <h1 className="font-display text-2xl font-bold mb-4">
          Desktop <span className="text-saf-blue">Only</span>
        </h1>
        <p className="text-white/50 mb-8 leading-relaxed">
          L&apos;aim trainer necessite une souris et un clavier.
          Ouvre cette page sur un ordinateur pour jouer.
        </p>
        <Link
          href="/"
          className="inline-flex px-6 py-3 border border-white/10 hover:border-saf-blue/40 font-display text-sm tracking-wider uppercase rounded-lg transition-colors text-white/60 hover:text-white"
        >
          Retour
        </Link>
      </div>
    </div>
  );
}
