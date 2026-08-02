import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";

const serviceSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  durationMin: z.number().int().positive(),
  priceCents: z.number().int().nonnegative(),
});

export async function listServices(_req: Request, res: Response) {
  const services = await prisma.service.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
  });
  return res.json(services);
}

export async function createService(req: Request, res: Response) {
  const parsed = serviceSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }

  const service = await prisma.service.create({ data: parsed.data });
  return res.status(201).json(service);
}

export async function updateService(req: Request, res: Response) {
  const { id } = req.params;
  const parsed = serviceSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }

  const service = await prisma.service.update({
    where: { id },
    data: parsed.data,
  });
  return res.json(service);
}

export async function deactivateService(req: Request, res: Response) {
  const { id } = req.params;
  await prisma.service.update({ where: { id }, data: { active: false } });
  return res.status(204).send();
}
