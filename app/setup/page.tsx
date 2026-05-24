"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { loadProfile, saveProfile } from "@/lib/storage";
import type { UserProfile } from "@/lib/prompts/aurora";

const FIELDS: Array<{ key: keyof UserProfile; label: string; placeholder: string; type?: string; long?: boolean }> = [
  { key: "nombre", label: "¿Cómo se llama?", placeholder: "Por ejemplo: María" },
  { key: "edad", label: "¿Cuántos años tiene?", placeholder: "78", type: "number" },
  { key: "ciudad", label: "¿Dónde vive?", placeholder: "Por ejemplo: Sevilla" },
  { key: "familia", label: "¿Quiénes son los suyos?", placeholder: "Hija Marta (vive en Madrid), nieto Pablo (8 años)...", long: true },
  { key: "historia", label: "¿Algo importante de su vida que Aurora deba conocer?", placeholder: "Fue maestra. Le encanta su pueblo, Aracena. Viuda desde 2019.", long: true },
  { key: "salud", label: "¿Hay algo de su salud que conviene tener en cuenta?", placeholder: "Hipertensión, artrosis de rodilla, toma Sintrom.", long: true },
  { key: "intereses", label: "¿Qué le hace feliz?", placeholder: "La música de Antonio Machín, hacer ganchillo, las películas de Cantinflas.", long: true },
  { key: "tutorNombre", label: "¿Quién es su persona de confianza?", placeholder: "Mi hija Marta" },
  { key: "tutorEmail", label: "Correo electrónico de esa persona (opcional)", placeholder: "marta@ejemplo.com", type: "email" },
];

export default function Setup() {
  const router = useRouter();
  const [p, setP] = useState<UserProfile>({});
  const [step, setStep] = useState(0);

  useEffect(() => {
    const existing = loadProfile();
    if (existing) setP(existing);
  }, []);

  const field = FIELDS[step];
  const isLast = step === FIELDS.length - 1;

  function update(v: string) {
    const value = field.type === "number" ? (v ? Number(v) : undefined) : v;
    setP({ ...p, [field.key]: value });
  }

  function next() {
    if (isLast) {
      saveProfile(p);
      router.push("/chat");
    } else {
      setStep(step + 1);
    }
  }

  function skip() {
    if (isLast) {
      saveProfile(p);
      router.push("/chat");
    } else {
      setStep(step + 1);
    }
  }

  const value = (p[field.key] ?? "") as string | number;

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="max-w-xl w-full">
        <p className="text-sepia text-base mb-2">
          Paso {step + 1} de {FIELDS.length}
        </p>
        <div className="paper-card p-8">
          <label className="block hand text-3xl text-ink mb-4">
            {field.label}
          </label>
          {field.long ? (
            <textarea
              className="w-full bg-cream border border-sepia rounded p-3 text-xl"
              rows={4}
              placeholder={field.placeholder}
              value={value as string}
              onChange={(e) => update(e.target.value)}
              autoFocus
            />
          ) : (
            <input
              className="w-full bg-cream border border-sepia rounded p-3 text-xl"
              type={field.type || "text"}
              placeholder={field.placeholder}
              value={value as string | number}
              onChange={(e) => update(e.target.value)}
              autoFocus
            />
          )}
          <div className="flex justify-between mt-6 items-center">
            <button
              className="btn ghost"
              onClick={() => setStep(Math.max(0, step - 1))}
              disabled={step === 0}
              style={{ opacity: step === 0 ? 0.3 : 1 }}
            >
              Atrás
            </button>
            <div className="flex gap-3">
              <button className="btn ghost" onClick={skip}>Saltar</button>
              <button className="btn" onClick={next}>
                {isLast ? "Empezar a hablar con Aurora" : "Siguiente"}
              </button>
            </div>
          </div>
        </div>
        <p className="text-sepia text-base mt-6 text-center italic">
          Aurora cuidará esta información. Solo se guarda en este dispositivo.
        </p>
      </div>
    </main>
  );
}
