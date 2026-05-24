"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { loadProfile, loadHistory, saveHistory, appendRemember, pushAlert } from "@/lib/storage";
import { parseAssistantTurn } from "@/lib/parse";
import type { Message, AlertType } from "@/lib/types";
import type { UserProfile } from "@/lib/prompts/aurora";

const URGENCY_BANNERS: Record<Exclude<AlertType, "ninguna">, { text: string; cta: string }> = {
  medica_urgente: {
    text: "Esto puede ser urgente. Llama al 112 ahora.",
    cta: "Llamar al 112",
  },
  caida: {
    text: "Si te has caído y no puedes moverte, llama al 112.",
    cta: "Llamar al 112",
  },
  crisis_emocional: {
    text: "No estás sola/o. El teléfono 024 atiende 24h, gratis.",
    cta: "Llamar al 024",
  },
  abuso: {
    text: "Lo que cuentas importa. Puedes hablar al 016 (atención 24h, gratis y confidencial).",
    cta: "Llamar al 016",
  },
  medica_no_urgente: {
    text: "Conviene comentarlo con tu médico de cabecera.",
    cta: "Apuntar para el médico",
  },
};

export default function Chat() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [draft, setDraft] = useState("");
  const [banner, setBanner] = useState<{ type: AlertType; text: string; cta: string } | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const p = loadProfile();
    if (!p?.nombre) { window.location.href = "/setup"; return; }
    setProfile(p);
    setMessages(loadHistory());
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, draft]);

  async function send(text: string) {
    if (!profile || !text.trim() || streaming) return;
    const userMsg: Message = { role: "user", content: text.trim(), ts: Date.now() };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    saveHistory(nextMessages);
    setInput("");
    setStreaming(true);
    setDraft("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile, messages: nextMessages }),
      });
      if (!res.ok || !res.body) throw new Error("network");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = "";
      // En streaming mostramos en bruto; al final, parseamos y limpiamos las etiquetas.
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        full += chunk;
        setDraft(stripTagsLive(full));
      }

      const parsed = parseAssistantTurn(full);
      const finalMsg: Message = { role: "assistant", content: parsed.visible, ts: Date.now() };
      const updated = [...nextMessages, finalMsg];
      setMessages(updated);
      saveHistory(updated);
      setDraft("");

      if (parsed.remember) appendRemember(parsed.remember);
      if (parsed.alert !== "ninguna") {
        pushAlert({ ts: Date.now(), type: parsed.alert, context: text });
        const b = URGENCY_BANNERS[parsed.alert];
        setBanner({ type: parsed.alert, text: b.text, cta: b.cta });
      }
    } catch (e) {
      const errMsg: Message = {
        role: "assistant",
        content: "Disculpa, ahora mismo no he podido oírte bien. ¿Lo intentamos otra vez en un momento?",
        ts: Date.now(),
      };
      setMessages([...nextMessages, errMsg]);
      setDraft("");
    } finally {
      setStreaming(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }

  function onKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  }

  function speak(text: string) {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "es-ES";
    u.rate = 0.95;
    u.pitch = 1.0;
    window.speechSynthesis.speak(u);
  }

  if (!profile) return null;

  const greeting = greet(profile.nombre || "");

  return (
    <main className="min-h-screen flex flex-col">
      <header className="px-6 py-4 flex items-center justify-between border-b border-sepia/40">
        <div>
          <Link href="/" className="hand text-3xl text-ink">Aurora</Link>
          <span className="ml-3 text-base text-sepia italic">para {profile.nombre}</span>
        </div>
        <Link href="/tutor" className="text-base text-sepia underline">
          Familia
        </Link>
      </header>

      {banner && (
        <div className="bg-rust text-cream px-6 py-4 flex items-center justify-between gap-4">
          <span className="text-xl">{banner.text}</span>
          <button className="btn ghost border-cream text-cream" onClick={() => setBanner(null)}>
            Entendido
          </button>
        </div>
      )}

      <section className="flex-1 overflow-y-auto px-4 md:px-8 py-6">
        <div className="max-w-3xl mx-auto space-y-5">
          {messages.length === 0 && (
            <div className="bubble-aurora p-5 md:p-6 max-w-[80%]">
              <p className="hand text-2xl text-rust mb-2">Aurora</p>
              <p>{greeting}</p>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
              <div className={`${m.role === "user" ? "bubble-user" : "bubble-aurora"} p-5 max-w-[80%] whitespace-pre-wrap`}>
                {m.role === "assistant" && (
                  <div className="flex justify-between items-baseline mb-1">
                    <p className="hand text-2xl text-rust">Aurora</p>
                    <button
                      onClick={() => speak(m.content)}
                      className="text-sm text-sepia underline"
                      aria-label="Leer en voz alta"
                    >
                      escuchar
                    </button>
                  </div>
                )}
                {m.content}
              </div>
            </div>
          ))}

          {streaming && draft && (
            <div className="flex justify-start">
              <div className="bubble-aurora p-5 max-w-[80%] whitespace-pre-wrap">
                <p className="hand text-2xl text-rust mb-1">Aurora</p>
                {draft}
                <span className="dot" /><span className="dot" /><span className="dot" />
              </div>
            </div>
          )}
          {streaming && !draft && (
            <div className="flex justify-start">
              <div className="bubble-aurora p-5">
                <span className="dot" /><span className="dot" /><span className="dot" />
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </section>

      <footer className="border-t border-sepia/40 px-4 md:px-8 py-4">
        <div className="max-w-3xl mx-auto flex gap-3 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKey}
            placeholder="Cuéntame…"
            rows={2}
            className="flex-1 bg-cream border border-sepia rounded-lg p-3 text-xl resize-none"
            disabled={streaming}
            aria-label="Escribe tu mensaje a Aurora"
          />
          <button
            onClick={() => send(input)}
            disabled={streaming || !input.trim()}
            className="btn"
            style={{ opacity: !input.trim() || streaming ? 0.5 : 1 }}
          >
            Enviar
          </button>
        </div>
        <p className="max-w-3xl mx-auto text-center text-sm text-sepia mt-2 italic">
          Aurora no sustituye a tu médico. En urgencias reales, marca 112.
        </p>
      </footer>
    </main>
  );
}

function greet(name: string): string {
  const h = new Date().getHours();
  const tramo = h < 6 ? "Es muy temprano" : h < 13 ? "Buenos días" : h < 21 ? "Buenas tardes" : "Buenas noches";
  return `${tramo}, ${name}. Me alegra que estés aquí. ¿Cómo te encuentras hoy?`;
}

// Mientras llega el stream, ocultamos las etiquetas internas para no romper la lectura.
function stripTagsLive(s: string): string {
  return s
    .replace(/\[ALERTA:[^\]]*\]?/gi, "")
    .replace(/\[RECORDAR:[^\]]*\]?/gi, "")
    .trimEnd();
}
