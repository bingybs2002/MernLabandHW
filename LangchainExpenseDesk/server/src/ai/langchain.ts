import { ChatAnthropic } from "@langchain/anthropic";
import { tool } from "@langchain/core/tools";
import { ai, MODEL } from "../llm";
import { readToolSchemas, runTool } from "../tools";

// ════════════════════════════════════════════════════════════════════════════════════════════════
// LangChain glue for workflow.ts and agent.ts
// ════════════════════════════════════════════════════════════════════════════════════════════════
//
// ChatAnthropic normally makes its own Anthropic client. Here createClient hands it a stand-in whose
// messages.create is the lab's ai.messages.create, so every LangChain model call still lands in the
// claim's trace and stays on MODEL. Non-streaming only: ai.messages.create never streams.

type CreateParams = Parameters<typeof ai.messages.create>[0];

const tracedClient = {
  messages: {
    // LangChain sends unset options as `undefined`; drop them so llm.ts keeps its own defaults
    create: (params: Record<string, unknown>) =>
      ai.messages.create(
        Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined)) as CreateParams,
      ),
  },
};

export function chatModel(maxTokens: number) {
  return new ChatAnthropic({
    model: MODEL,
    maxTokens,
    streaming: false,
    thinking: { type: "disabled" },
    createClient: () => tracedClient,
  });
}

// The read tools, as LangChain tools. They reuse the lab's schemas and run through runTool, so each
// call is traced and errors come back as text the model can read. payClaim is never wrapped.
export const readTools = readToolSchemas.map((schema) =>
  tool((input: unknown) => runTool(schema.name, input), {
    name: schema.name,
    description: schema.description ?? schema.name,
    schema: schema.input_schema as Record<string, unknown>,
  }),
);
