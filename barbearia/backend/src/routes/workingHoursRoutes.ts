import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";

const router = Router();

router.get("/", async (_req, res) => {
  const hours = await prisma.workingHours.findMany({ orderBy: { weekday: "asc" } });
  res.json(hours);
});

const workingHoursSchema = z.object({
  weekday: z.number().int().min(0).max(6),
  startTime: z.string(),
  endTime: z.string(),
});

router.put("/:weekday", async (req, res) => {
  const parsed = workingHoursSchema.safeParse({
    ...req.body,
    weekday: Number(req.params.weekday),
  });
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }

  const { weekday, startTime, endTime } = parsed.data;

  const updated = await prisma.workingHours.upsert({
    where: { weekday },
    update: { startTime, endTime },
    create: { weekday, startTime, endTime },
  });

  res.json(updated);
});

router.delete("/:weekday", async (req, res) => {
  await prisma.workingHours.delete({ where: { weekday: Number(req.params.weekday) } });
  res.status(204).send();
});

export default router;
