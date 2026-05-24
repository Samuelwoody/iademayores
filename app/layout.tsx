import "./globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Aurora — Una compañía para los mayores",
  description:
    "Aurora es una compañía hecha con inteligencia artificial, pensada con cariño para personas mayores. Escucha, acompaña y avisa a la familia cuando hace falta.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
