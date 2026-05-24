export interface Message {
  role: "user" | "assistant" | "system";
  content: string;
  ts: number;
}

export type AlertType =
  | "medica_urgente"
  | "medica_no_urgente"
  | "crisis_emocional"
  | "abuso"
  | "caida"
  | "ninguna";

export interface ParsedAssistantTurn {
  visible: string;          // texto mostrado a la persona
  alert: AlertType;         // bandera roja detectada
  remember: string | null;  // hecho a guardar en la ficha
}

export interface Summary {
  estado_animico:
    | "tranquilo"
    | "alegre"
    | "nostalgico"
    | "ansioso"
    | "triste"
    | "irritable"
    | "confundido"
    | "mixto";
  resumen: string;
  temas_conversados: string[];
  alegrias: string[];
  preocupaciones: Array<{
    tipo: "salud" | "emocional" | "social" | "memoria" | "otro";
    descripcion: string;
    urgencia: "baja" | "media" | "alta";
  }>;
  sugerencias_familia: string[];
  mencionar_en_proxima_llamada: string[];
}
