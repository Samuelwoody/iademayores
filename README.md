# Aurora — IA de mayores

> Una compañía pensada con cariño para personas mayores.
> Escucha, acompaña, pre-orienta médicamente sin diagnosticar, y avisa a la familia cuando hace falta.

Arquitectura **prompt-first** y **minimalista**: el alma del producto vive en
`lib/prompts/aurora.ts`. El código es la mínima envoltura imprescindible para
servir, escuchar y proteger a quien está al otro lado.

---

## Filosofía

Tres principios no negociables:

1. **Estar antes que servir.** Aurora no es una asistente con tareas. Es una
   presencia. El primer regalo a un mayor es alguien que escucha sin prisa.
2. **Honestidad clínica.** Nunca diagnostica. Nunca medica. Nunca minimiza.
   Tiene un protocolo de banderas rojas que la lleva del modo "compañía"
   al modo "vamos a buscar ayuda real, juntos".
3. **La familia, en el bucle.** Aurora no sustituye a los hijos: les da
   contexto. Resumen diario, alertas, cosas que mencionar en la próxima llamada.

## Arquitectura

```
app/
  page.tsx               Portada vintage
  setup/page.tsx         Onboarding suave: el sistema conoce a la persona
  chat/page.tsx          Conversación en streaming con Aurora
  tutor/page.tsx         Panel para hijos/tutores: resumen, alertas
  api/chat/route.ts      Streaming SSE con OpenAI (edge runtime)
  api/summary/route.ts   Genera resumen estructurado JSON para el tutor

lib/
  prompts/aurora.ts      ★ EL CORAZÓN. Prompt maestro de Aurora.
  prompts/summary.ts     Prompt del resumen para la familia.
  parse.ts               Extrae etiquetas [ALERTA: ...] / [RECORDAR: ...]
  storage.ts             Persistencia mínima en localStorage
  types.ts
```

### El prompt maestro (`lib/prompts/aurora.ts`)

Está dividido en bloques etiquetados (`[# IDENTIDAD]`, `[# ESCUCHA ACTIVA]`,
`[# BANDERAS ROJAS]`, etc.) precisamente para que **un geriatra o un
psicólogo pueda revisarlo y proponer cambios sin tocar código.**

Incorpora principios de:

- Escucha activa (Rogers).
- Atención centrada en la persona (Kitwood — demencia).
- Triaje no-clínico con derivación cálida.
- Protocolo de crisis adaptado de Safe-T / Columbia.
- Comunicación geriátrica: frases cortas, una idea por turno, sin jerga.

### Etiquetas internas

Aurora emite, al final de cada turno, **dos etiquetas opcionales** que el
usuario no ve y el sistema sí:

- `[ALERTA: tipo]` — bandera roja detectada. Tipos: `medica_urgente`,
  `medica_no_urgente`, `crisis_emocional`, `abuso`, `caida`, `ninguna`.
  Activa un banner inmediato en el chat y queda registrada para el tutor.
- `[RECORDAR: hecho]` — algo nuevo que la persona ha contado y conviene
  guardar (un nieto recién nacido, una cita médica, un aniversario).
  Se añade automáticamente a la ficha personal.

Esto convierte la conversación en **memoria viva** y en **señal accionable
para la familia**, sin necesidad de una segunda llamada al modelo.

## Accesibilidad

- Tipografía base 22px, serif, alto contraste sepia/tinta.
- Botones grandes con sombra impresa (mejor feedback motor).
- Botón "escuchar" en cada respuesta de Aurora (Web Speech API).
- Mensaje de error humano, no técnico.
- Foco visible reforzado.
- Saludo según hora del día.

## Estética vintage

- Crimson Pro (serif clásica) para el cuerpo.
- Caveat (manuscrita) para el nombre "Aurora" y los detalles cálidos.
- Paleta papel-tinta-rust-sepia.
- Textura sutil de papel envejecido en el fondo.
- Burbujas con curvas asimétricas, no "chat moderno frío".

## Cómo desplegar

```bash
npm install
cp .env.example .env.local      # añade tu OPENAI_API_KEY
npm run dev
```

Despliegue en Vercel: 1 clic. Solo necesita la variable `OPENAI_API_KEY`.

## Camino a producción (lo que falta para ser "de verdad" la mejor del mundo)

Esta entrega es una **base de clase mundial**. Para llevarla a producción
con personas mayores reales hace falta:

- **Validación clínica**: revisión del prompt por geriatras y psicólogos
  especializados, idealmente con consentimiento informado y un comité ético.
- **Persistencia real**: hoy el perfil vive en `localStorage` (privacidad
  por defecto, cero servidor). Producción necesita base de datos cifrada,
  RGPD, retención y derecho al olvido.
- **Notificación al tutor**: hoy el panel se consulta. Producción necesita
  email/SMS/WhatsApp con webhook desde `api/summary` y desde cada `[ALERTA: ...]`.
- **Voz bidireccional**: Whisper para escuchar (manos torpes, gafas perdidas)
  y TTS de mayor calidad (ElevenLabs) para una voz cálida específica.
- **Integración con teleasistencia real** (Cruz Roja, Vitalia, etc.) para
  cerrar el bucle en urgencias verdaderas.
- **Multilingüe / dialectal**: catalán, gallego, euskera, y variantes
  latinoamericanas.
- **Auditoría de seguridad** sobre el protocolo de banderas rojas y casos
  límite (delirios, demencia avanzada, episodios paranoides).

Estas son las piezas que convierten "una buena demo" en "la mejor IA del
mundo para mayores". El cimiento ya está aquí.

## Licencia y aviso

Aurora **no** es un dispositivo médico ni un servicio de teleasistencia
regulado. En urgencias reales: **112**. Crisis emocional en España: **024**.
Violencia: **016**.
