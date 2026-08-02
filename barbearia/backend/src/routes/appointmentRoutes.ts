import { Router } from "express";
import {
  cancelAppointment,
  createAppointment,
  getAvailability,
  listAllAppointments,
  listMyAppointments,
  updateAppointmentStatus,
} from "../controllers/appointmentController";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.get("/availability", getAvailability);
router.post("/", requireAuth, createAppointment);
router.get("/me", requireAuth, listMyAppointments);
// Rotas do painel do barbeiro: abertas por link, sem exigir login
router.get("/", listAllAppointments);
router.patch("/:id/status", updateAppointmentStatus);
router.patch("/:id/cancel", requireAuth, cancelAppointment);

export default router;
