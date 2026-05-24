import OpenAI from "openai";
import { SUMMARY_SYSTEM_PROMPT, buildSummaryUserPrompt } from "@/lib/prompts/summary";
import type { Message, Summary } from "@/lib/types";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface Body {
  messages: Message[];
  profileName?: string;
}

export async function POST(req: Request) {
  const { messages, profileName } = (await req.json()) as Body;

  const transcript = messages
    .filter((m) => m.role !== "system")
    .map((m) => `${m.role === "user" ? profileName || "Mayor" : "Aurora"}: ${m.content}`)
    .join("\n");

  const r = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.3,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SUMMARY_SYSTEM_PROMPT },
      { role: "user", content: buildSummaryUserPrompt(transcript, profileName) },
    ],
  });

  const content = r.choices[0]?.message?.content || "{}";
  let parsed: Summary;
  try {
    parsed = JSON.parse(content) as Summary;
  } catch {
    return Response.json({ error: "parse_error", raw: content }, { status: 500 });
  }

  return Response.json(parsed);
}
