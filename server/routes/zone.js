import { Router } from "express";
import {
  getMyZoneStats,
  getZoneComplaints,
  updateZoneComplaintStatus,
} from "../controllers/zoneController.js";
import { auth, authorize } from "../middleware/auth.js";

const router = Router();

router.use(auth, authorize("ZONE_HEAD"));

router.get("/my-stats", getMyZoneStats);
router.get("/complaints", getZoneComplaints);
router.put("/complaints/:id/status", updateZoneComplaintStatus);

export default router;
