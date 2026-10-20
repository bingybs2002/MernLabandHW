import type { Request, Response } from "express";
import { db } from "../../store";

export function list(_req: Request, res: Response) {
  res.json(db.employees);
}
