"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { loadProfile } from "@/lib/storage";

export default function Home() {
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);

  useEffect(() => {
    setHasProfile(!!loadProfile()?.nombre);
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="max-w-2xl text-center">
        <h1 className="hand text-6xl md:text-7xl text-ink mb-2">Aurora</h1>
        <p className="text-sepia italic mb-10">
          Una compañía pensada con cariño para los mayores.
        </p>

        <div className="paper-card p-8 md:p-10 mb-8 text-left">
          <p className="mb-4">
            Aurora te escucha sin prisa. Recuerda lo que le cuentas, te acompaña
            cuando el día es largo, y avisa a tu familia si algo de verdad lo
            necesita.
          </p>
          <p className="mb-4">
            No reemplaza a tu médico ni a los tuyos. Está aquí entre llamada
            y llamada, entre visita y visita.
          </p>
          <p className="hand text-3xl text-rust mt-6">
            «Estoy aquí, sin prisa.»
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 justify-center">
          {hasProfile ? (
            <Link href="/chat" className="btn text-center">
              Hablar con Aurora
            </Link>
          ) : (
            <Link href="/setup" className="btn text-center">
              Empezar
            </Link>
          )}
          <Link href="/tutor" className="btn ghost text-center">
            Soy familia o tutor
          </Link>
        </div>

        <p className="mt-12 text-base text-sepia">
          En caso de urgencia médica real, llama al <strong>112</strong>.<br />
          Si tienes pensamientos de hacerte daño, llama al <strong>024</strong>{" "}
          (atención 24h, gratis, en España).
        </p>
      </div>
    </main>
  );
}
