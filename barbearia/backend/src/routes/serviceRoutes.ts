import { Router } from "express";
import {
  createService,
  deactivateService,
  listServices,
  updateService,
} from "../controllers/serviceController";

const router = Router();

// Painel administrativo é aberto por link, sem exigir login
router.get("/", listServices);
router.post("/", createService);
router.put("/:id", updateService);
router.delete("/:id", deactivateService);

export default router;
