import Anthropic from "@anthropic-ai/sdk";
import { record } from "./trace/trace";

// The model client to use in src/ai/. It is the normal Anthropic SDK call, `ai.messages.create(...)`,
// plus two things: every call is recorded in the claim's trace (tokens, stop reason, tools asked for),
// and the model is always MODEL, so the whole class stays on the same cheap model.

export const MODEL = "claude-haiku-5-5";

type CreateParams = Omit<Anthropic.MessageCreateParamsNonStreaming, "model"> & { model?: string };

let client: Anthropic | undefined;

async function create(params: CreateParams): Promise<Anthropic.Message> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is missing: copy .env.example to .env and paste your key");
  }
  client ??= new Anthropic();
  if (params.model && params.model !== MODEL) {
    console.warn(`[llm] model "${params.model}" replaced with ${MODEL}`);
  }

  const started = Date.now();
  const response = await client.messages.create({
    thinking: { type: "disabled" }, // cheaper, and token counts stay comparable between students
    ...params,
    model: MODEL,
    stream: false,
  });

  record({
    kind: "model",
    model: response.model,
    inputTokens: response.usage.input_tokens,
    outputTokens: response.usage.output_tokens,
    stopReason: response.stop_reason,
    toolsRequested: response.content.flatMap((b) => (b.type === "tool_use" ? [b.name] : [])),
    text: response.content
      .flatMap((b) => (b.type === "text" ? [b.text] : []))
      .join(" ")
      .slice(0, 300),
    ms: Date.now() - started,
  });
  return response;
}

export const ai = { messages: { create } };
