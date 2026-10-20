import { createApp } from "./app";
import { MODEL } from "./llm";

const port = Number(process.env.PORT ?? 3001);

createApp().listen(port, () => {
  console.log(`Expense Desk API on http://localhost:${port} (in-memory data: resets on restart)`);
  if (!process.env.ANTHROPIC_API_KEY)
    console.warn("No ANTHROPIC_API_KEY yet: copy .env.example to .env");
  else console.log(`Model calls use ${MODEL}`);
});
