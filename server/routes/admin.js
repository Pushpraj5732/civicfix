import { Router } from "express";
import {
  getAdminStats,
  getZoneStats,
  getZones,
} from "../controllers/adminController.js";
import { auth, authorize } from "../middleware/auth.js";

const router = Router();

router.use(auth, authorize("ADMIN"));

router.get("/stats", getAdminStats);
router.get("/zone-stats", getZoneStats);
router.get("/zones", getZones);

export default router;
