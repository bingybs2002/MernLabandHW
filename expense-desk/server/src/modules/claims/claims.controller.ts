import type { Request, Response } from "express";
import * as service from "./claims.service";

export function list(_req: Request, res: Response) {
  res.json(service.listClaims());
}

export function get(req: Request<{ id: string }>, res: Response) {
  res.json(service.getClaimDetail(req.params.id));
}

export function create(req: Request, res: Response) {
  res.status(201).json(service.createClaim(req.body));
}

export async function process(req: Request<{ id: string }>, res: Response) {
  res.json(await service.processClaimById(req.params.id));
}

export function trace(req: Request<{ id: string }>, res: Response) {
  res.json(service.getClaimTrace(req.params.id));
}
