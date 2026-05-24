"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { loadProfile, loadHistory, loadAlerts } from "@/lib/storage";
import type { Summary } from "@/lib/types";
import type { UserProfile } from "@/lib/prompts/aurora";

const URGENCY_COLOR = {
  baja: "#7a8c5a",
  media: "#b8842b",
  alta: "#9c4a2c",
};

const ALERT_LABEL: Record<string, string> = {
  medica_urgente: "Médico urgente",
  medica_no_urgente: "Médico, no urgente",
  crisis_emocional: "Crisis emocional",
  abuso: "Posible abuso",
  caida: "Caída",
};

export default function Tutor() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [alerts, setAlerts] = useState<ReturnType<typeof loadAlerts>>([]);
  const [msgCount, setMsgCount] = useState(0);

  useEffect(() => {
    setProfile(loadProfile());
    setAlerts(loadAlerts().sort((a, b) => b.ts - a.ts));
    setMsgCount(loadHistory().length);
  }, []);

  async function generate() {
    setLoading(true);
    setError(null);
    try {
      const history = loadHistory();
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todays = history.filter((m) => m.ts >= today.getTime());
      const list = todays.length >= 4 ? todays : history.slice(-40);

      const res = await fetch("/api/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: list, profileName: profile?.nombre }),
      });
      if (!res.ok) throw new Error("network");
      const data = (await res.json()) as Summary;
      setSummary(data);
    } catch {
      setError("No he podido generar el resumen ahora mismo. Inténtalo en un minuto.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen px-6 py-10">
      <div className="max-w-3xl mx-auto">
        <header className="flex items-baseline justify-between mb-8">
          <div>
            <Link href="/" className="hand text-4xl text-ink">Aurora</Link>
            <p className="text-sepia italic">Panel de familia</p>
          </div>
          <Link href="/chat" className="text-base text-sepia underline">Volver al chat</Link>
        </header>

        {!profile?.nombre ? (
          <div className="paper-card p-6">
            <p>Aún no hay un perfil configurado en este dispositivo.</p>
            <Link href="/setup" className="btn mt-4 inline-block">Configurar perfil</Link>
          </div>
        ) : (
          <>
            <section className="paper-card p-6 mb-6">
              <h2 className="hand text-3xl text-ink mb-2">{profile.nombre}</h2>
              {profile.edad && <p className="text-base text-sepia">{profile.edad} años{profile.ciudad ? ` · ${profile.ciudad}` : ""}</p>}
              <p className="mt-3 text-base">Conversaciones guardadas: {msgCount}</p>
            </section>

            {alerts.length > 0 && (
              <section className="paper-card p-6 mb-6">
                <h3 className="hand text-2xl mb-3 text-rust">Alertas recientes</h3>
                <ul className="space-y-2">
                  {alerts.slice(0, 8).map((a, i) => (
                    <li key={i} className="flex justify-between text-base border-b border-sepia/20 py-2">
                      <span>
                        <strong>{ALERT_LABEL[a.type] || a.type}</strong>
                        <span className="text-sepia italic"> — “{a.context.slice(0, 70)}{a.context.length > 70 ? "…" : ""}”</span>
                      </span>
                      <span className="text-sepia">{new Date(a.ts).toLocaleString("es-ES")}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section className="paper-card p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="hand text-2xl text-ink">Resumen del día</h3>
                <button onClick={generate} disabled={loading} className="btn">
                  {loading ? "Preparando…" : "Generar resumen"}
                </button>
              </div>

              {error && <p className="text-rust">{error}</p>}

              {summary && (
                <div className="space-y-5 mt-2">
                  <div>
                    <p className="text-sepia italic text-base mb-1">Cómo ha estado</p>
                    <p><strong className="capitalize">{summary.estado_animico}</strong>. {summary.resumen}</p>
                  </div>

                  {summary.temas_conversados.length > 0 && (
                    <div>
                      <p className="text-sepia italic text-base mb-1">De qué hablaron</p>
                      <p>{summary.temas_conversados.join(" · ")}</p>
                    </div>
                  )}

                  {summary.alegrias.length > 0 && (
                    <div>
                      <p className="text-sepia italic text-base mb-1">Pequeñas alegrías</p>
                      <ul className="list-disc pl-5">
                        {summary.alegrias.map((a, i) => <li key={i}>{a}</li>)}
                      </ul>
                    </div>
                  )}

                  {summary.preocupaciones.length > 0 && (
                    <div>
                      <p className="text-sepia italic text-base mb-1">Lo que conviene mirar</p>
                      <ul className="space-y-2">
                        {summary.preocupaciones.map((p, i) => (
                          <li key={i} className="border-l-4 pl-3" style={{ borderColor: URGENCY_COLOR[p.urgencia] }}>
                            <span className="text-sm uppercase tracking-wide" style={{ color: URGENCY_COLOR[p.urgencia] }}>
                              {p.tipo} · urgencia {p.urgencia}
                            </span>
                            <p>{p.descripcion}</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {summary.sugerencias_familia.length > 0 && (
                    <div>
                      <p className="text-sepia italic text-base mb-1">Qué podéis hacer hoy</p>
                      <ul className="list-disc pl-5">
                        {summary.sugerencias_familia.map((s, i) => <li key={i}>{s}</li>)}
                      </ul>
                    </div>
                  )}

                  {summary.mencionar_en_proxima_llamada.length > 0 && (
                    <div className="bg-cream/50 p-3 rounded">
                      <p className="hand text-xl text-rust mb-1">Para mencionar en la próxima llamada</p>
                      <ul className="list-disc pl-5">
                        {summary.mencionar_en_proxima_llamada.map((s, i) => <li key={i}>{s}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </section>

            <p className="text-sm text-sepia italic text-center">
              Los datos viven solo en este dispositivo. Aurora no es un servicio médico
              ni un sistema de teleasistencia regulado.
            </p>
          </>
        )}
      </div>
    </main>
  );
}
