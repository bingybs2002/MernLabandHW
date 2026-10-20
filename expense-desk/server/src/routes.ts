import { Router } from "express";
import { claimsRouter } from "./modules/claims/claims.routes";
import { employeesRouter } from "./modules/employees/employees.routes";
import { resetStore } from "./store";
import { clearTraces } from "./trace/trace";

export const apiRouter = Router();

apiRouter.use("/claims", claimsRouter);
apiRouter.use("/employees", employeesRouter);

// Put every claim back to "new", drop all results, payments and traces
apiRouter.post("/admin/reset", (_req, res) => {
  resetStore();
  clearTraces();
  res.status(204).end();
});
