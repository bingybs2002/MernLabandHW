import { Router } from "express";
import { clearRuns } from "./ai/workflow";
import { claimsRouter } from "./modules/claims/claims.routes";
import { employeesRouter } from "./modules/employees/employees.routes";
import { resetStore } from "./store";
import { clearTraces } from "./trace/trace";

export const apiRouter = Router();

apiRouter.use("/claims", claimsRouter);
apiRouter.use("/employees", employeesRouter);

// Put every claim back to "new", drop all results, payments, traces and saved workflow runs
apiRouter.post("/admin/reset", async (_req, res) => {
  resetStore();
  clearTraces();
  await clearRuns();
  res.status(204).end();
});
