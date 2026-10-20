import { Router } from "express";
import * as controller from "./employees.controller";

export const employeesRouter = Router();

employeesRouter.get("/", controller.list);
