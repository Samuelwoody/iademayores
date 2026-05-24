import OpenAI from "openai";
import { auroraSystemPrompt, type UserProfile } from "@/lib/prompts/aurora";
import type { Message } from "@/lib/types";

export const runtime = "edge";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface Body {
  profile: UserProfile;
  messages: Message[];
}

export async function POST(req: Request) {
  const { profile, messages } = (await req.json()) as Body;

  const today = new Date().toLocaleDateString("es-ES", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  const system = auroraSystemPrompt(profile, today);

  const stream = await openai.chat.completions.create({
    model: "gpt-4o",
    stream: true,
    temperature: 0.7,
    presence_penalty: 0.3,
    frequency_penalty: 0.2,
    messages: [
      { role: "system", content: system },
      ...messages.map((m) => ({ role: m.role, content: m.content })),
    ],
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content;
        if (delta) controller.enqueue(encoder.encode(delta));
      }
      controller.close();
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
