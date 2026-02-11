import { Router } from "express";
import {
  createComplaint,
  uploadImage,
  getComplaints,
  getMyComplaints,
  getComplaintById,
  updateStatus,
  getComplaintImages,
} from "../controllers/complaintController.js";
import { auth } from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const router = Router();

router.post("/", auth, createComplaint);
router.post("/:id/upload-image", auth, upload.single("file"), uploadImage);
router.get("/", auth, getComplaints);
router.get("/my", auth, getMyComplaints);
router.get("/:id", auth, getComplaintById);
router.get("/:id/images", auth, getComplaintImages);
router.put("/:id/status", auth, updateStatus);

export default router;
