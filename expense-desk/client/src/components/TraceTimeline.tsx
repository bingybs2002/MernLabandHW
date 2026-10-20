import { tokens } from "../format";
import type { TraceEvent } from "../types";

const seconds = (ms: number) => `+${(ms / 1000).toFixed(1)}s`;

// Everything the last run did, in order: model calls, tool calls and your own note() labels.
// Use it to check that the workflow and the agent did what your design says.
export default function TraceTimeline({ events }: { events: TraceEvent[] }) {
  if (events.length === 0) return <p className="muted">No run yet. Press "Process with AI".</p>;

  const models = events.filter((e) => e.kind === "model");
  const totalTokens = models.reduce(
    (sum, e) => sum + (e.kind === "model" ? e.inputTokens + e.outputTokens : 0),
    0,
  );
  const toolCalls = events.filter((e) => e.kind === "tool").length;

  return (
    <div className="card trace">
      <h3>
        Trace{" "}
        <span className="muted">
          {models.length} model calls · {tokens(totalTokens)} tokens · {toolCalls} tool calls
        </span>
      </h3>
      <ol>
        {events.map((e, i) => (
          <li key={i} className={`event event-${e.kind}`}>
            <span className="at">{seconds(e.at)}</span>
            <EventBody event={e} />
          </li>
        ))}
      </ol>
    </div>
  );
}

function EventBody({ event: e }: { event: TraceEvent }) {
  switch (e.kind) {
    case "model":
      return (
        <div>
          <strong>🧠 model</strong> {tokens(e.inputTokens)} in / {tokens(e.outputTokens)} out ·
          stop: {e.stopReason}
          {e.toolsRequested.length > 0 && <> → asks for {e.toolsRequested.join(", ")}</>}
          {e.text && <div className="muted clip">{e.text}</div>}
        </div>
      );
    case "tool":
      return (
        <details>
          <summary>
            <strong>🔧 {e.name}</strong> <code>{JSON.stringify(e.input)}</code>
            {e.error && <span className="error-text"> {e.error}</span>}
          </summary>
          <pre>{e.output}</pre>
        </details>
      );
    case "note":
      return (
        <div>
          <strong>📍 {e.label}</strong> {e.detail && <span className="muted">{e.detail}</span>}
        </div>
      );
    case "error":
      return <div className="error-text">❌ {e.message}</div>;
  }
}
