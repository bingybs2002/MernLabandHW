import { Router } from "express";
import * as controller from "./claims.controller";

export const claimsRouter = Router();

claimsRouter.get("/", controller.list);
claimsRouter.post("/", controller.create);
claimsRouter.get("/:id", controller.get);
claimsRouter.post("/:id/process", controller.process);
claimsRouter.get("/:id/trace", controller.trace);
