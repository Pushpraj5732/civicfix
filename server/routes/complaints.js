import { Router } from "express";
import { body } from "express-validator";
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

const complaintValidators = [
  body("issueType")
    .isIn(["ROAD", "GARBAGE", "DRAINAGE", "STREET_LIGHT"])
    .withMessage("Issue type must be one of: ROAD, GARBAGE, DRAINAGE, STREET_LIGHT"),
  body("description")
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage("Description must be between 10 and 1000 characters"),
  body("address")
    .trim()
    .notEmpty()
    .withMessage("Address/Location details are required")
    .isLength({ max: 200 })
    .withMessage("Address cannot exceed 200 characters"),
];

router.post("/", auth, complaintValidators, createComplaint);
router.post("/:id/upload-image", auth, upload.single("file"), uploadImage);
router.get("/", auth, getComplaints);
router.get("/my", auth, getMyComplaints);
router.get("/:id", auth, getComplaintById);
router.get("/:id/images", auth, getComplaintImages);
router.put("/:id/status", auth, updateStatus);

export default router;
