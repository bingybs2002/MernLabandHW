import { AsyncLocalStorage } from "node:async_hooks";

// Records everything that happens while one claim is processed: every model call, every tool call,
// and any notes you add. The app shows it as a timeline under the claim.
// You never pass a trace around: runWithTrace() sets the current claim, and the tools and the
// model client record into it automatically.

export type TraceEvent =
  | {
      kind: "model";
      at: number; // ms since the run started
      model: string;
      inputTokens: number;
      outputTokens: number;
      stopReason: string | null;
      toolsRequested: string[];
      text: string; // the start of the model's text reply
      ms: number;
    }
  | { kind: "tool"; at: number; name: string; input: unknown; output: string; error?: string }
  | { kind: "note"; at: number; label: string; detail?: string }
  | { kind: "error"; at: number; message: string };

type Run = { claimId: string; started: number; events: TraceEvent[] };

const runs = new Map<string, Run>(); // claimId → its latest run
const current = new AsyncLocalStorage<Run>();

// The same events without "at": record() fills that in
type NewEvent = TraceEvent extends infer E ? (E extends unknown ? Omit<E, "at"> : never) : never;

// Start a fresh trace for this claim and run fn inside it
export function runWithTrace<T>(claimId: string, fn: () => Promise<T>): Promise<T> {
  const run: Run = { claimId, started: Date.now(), events: [] };
  runs.set(claimId, run);
  return current.run(run, fn);
}

export function record(event: NewEvent) {
  const run = current.getStore();
  if (!run) return; // called outside a claim run (for example from a script): nothing to record
  run.events.push({ ...event, at: Date.now() - run.started } as TraceEvent);
}

// Use this in your own code to label your steps, so the timeline shows your architecture.
// Example: note("router", "category = hotel")
export function note(label: string, detail?: string) {
  record({ kind: "note", label, detail });
}

export function getTrace(claimId: string): TraceEvent[] {
  return runs.get(claimId)?.events ?? [];
}

export function clearTraces() {
  runs.clear();
}
