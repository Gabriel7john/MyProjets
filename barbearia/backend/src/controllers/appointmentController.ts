import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { generateAvailableSlots, minutesToTime, timeToMinutes } from "../lib/timeSlots";

const availabilityQuerySchema = z.object({
  date: z.string(), // "YYYY-MM-DD"
  serviceId: z.string().uuid(),
});

const createAppointmentSchema = z.object({
  serviceId: z.string().uuid(),
  date: z.string(), // "YYYY-MM-DD"
  startTime: z.string(), // "HH:mm"
});

// GET /appointments/availability?date=2026-07-20&serviceId=...
export async function getAvailability(req: Request, res: Response) {
  const parsed = availabilityQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ error: "Parâmetros inválidos" });
  }
  const { date, serviceId } = parsed.data;

  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service) {
    return res.status(404).json({ error: "Serviço não encontrado" });
  }

  const parsedDate = new Date(`${date}T00:00:00`);
  const weekday = parsedDate.getDay();

  const workingHours = await prisma.workingHours.findUnique({ where: { weekday } });
  if (!workingHours) {
    return res.json({ slots: [] }); // barbearia fechada nesse dia
  }

  const dayStart = new Date(`${date}T00:00:00`);
  const dayEnd = new Date(`${date}T23:59:59`);

  const existingAppointments = await prisma.appointment.findMany({
    where: {
      date: { gte: dayStart, lte: dayEnd },
      status: { not: "CANCELED" },
    },
    select: { startTime: true, endTime: true },
  });

  const blockedSlots = await prisma.blockedSlot.findMany({
    where: { date: { gte: dayStart, lte: dayEnd } },
    select: { startTime: true, endTime: true },
  });

  const slots = generateAvailableSlots({
    workStart: workingHours.startTime,
    workEnd: workingHours.endTime,
    serviceDurationMin: service.durationMin,
    taken: [...existingAppointments, ...blockedSlots],
  });

  return res.json({ slots });
}

export async function createAppointment(req: Request, res: Response) {
  const parsed = createAppointmentSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }
  const { serviceId, date, startTime } = parsed.data;

  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service) {
    return res.status(404).json({ error: "Serviço não encontrado" });
  }

  const endTime = minutesToTime(timeToMinutes(startTime) + service.durationMin);
  const parsedDate = new Date(`${date}T00:00:00`);
  const dayStart = new Date(`${date}T00:00:00`);
  const dayEnd = new Date(`${date}T23:59:59`);

  // Revalida o conflito no momento da criação (evita corrida entre dois clientes)
  const conflicting = await prisma.appointment.findFirst({
    where: {
      date: { gte: dayStart, lte: dayEnd },
      status: { not: "CANCELED" },
      AND: [
        { startTime: { lt: endTime } },
        { endTime: { gt: startTime } },
      ],
    },
  });

  if (conflicting) {
    return res.status(409).json({ error: "Este horário acabou de ser reservado. Escolha outro." });
  }

  const appointment = await prisma.appointment.create({
    data: {
      clientId: req.user!.id,
      serviceId,
      date: parsedDate,
      startTime,
      endTime,
    },
    include: { service: true },
  });

  return res.status(201).json(appointment);
}

export async function listMyAppointments(req: Request, res: Response) {
  const appointments = await prisma.appointment.findMany({
    where: { clientId: req.user!.id },
    include: { service: true },
    orderBy: { date: "desc" },
  });
  return res.json(appointments);
}

export async function listAllAppointments(req: Request, res: Response) {
  const { date } = req.query;

  const where = date
    ? {
        date: {
          gte: new Date(`${date}T00:00:00`),
          lte: new Date(`${date}T23:59:59`),
        },
      }
    : {};

  const appointments = await prisma.appointment.findMany({
    where,
    include: { service: true, client: { select: { name: true, phone: true, email: true } } },
    orderBy: [{ date: "asc" }, { startTime: "asc" }],
  });
  return res.json(appointments);
}

export async function cancelAppointment(req: Request, res: Response) {
  const { id } = req.params;

  const appointment = await prisma.appointment.findUnique({ where: { id } });
  if (!appointment) {
    return res.status(404).json({ error: "Agendamento não encontrado" });
  }

  const isOwner = appointment.clientId === req.user!.id;
  const isAdmin = req.user!.role === "ADMIN";
  if (!isOwner && !isAdmin) {
    return res.status(403).json({ error: "Você não pode cancelar este agendamento" });
  }

  const updated = await prisma.appointment.update({
    where: { id },
    data: { status: "CANCELED" },
  });

  return res.json(updated);
}

export async function updateAppointmentStatus(req: Request, res: Response) {
  const { id } = req.params;
  const statusSchema = z.object({
    status: z.enum(["CONFIRMED", "CANCELED", "COMPLETED", "NO_SHOW"]),
  });

  const parsed = statusSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Status inválido" });
  }

  const updated = await prisma.appointment.update({
    where: { id },
    data: { status: parsed.data.status },
  });

  return res.json(updated);
}
