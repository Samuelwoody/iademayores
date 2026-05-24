import type { AlertType, ParsedAssistantTurn } from "./types";

const ALERT_RE = /\[ALERTA:\s*(medica_urgente|medica_no_urgente|crisis_emocional|abuso|caida|ninguna)\s*\]/i;
const REMEMBER_RE = /\[RECORDAR:\s*([^\]]+)\]/i;

/**
 * Extrae las etiquetas internas del turno de Aurora.
 * - [ALERTA: ...] activa notificación al tutor.
 * - [RECORDAR: ...] añade un hecho a la ficha del usuario.
 * Ambas se eliminan del texto que ve la persona mayor.
 */
export function parseAssistantTurn(raw: string): ParsedAssistantTurn {
  const alertMatch = raw.match(ALERT_RE);
  const rememberMatch = raw.match(REMEMBER_RE);

  const alert = (alertMatch?.[1]?.toLowerCase() as AlertType) || "ninguna";
  const remember = rememberMatch?.[1]?.trim() || null;

  const visible = raw
    .replace(ALERT_RE, "")
    .replace(REMEMBER_RE, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return { visible, alert, remember };
}
