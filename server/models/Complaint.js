import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    issueType: {
      type: String,
      enum: ["ROAD", "GARBAGE", "DRAINAGE", "STREET_LIGHT"],
      required: [true, "Issue type is required"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    latitude: {
      type: Number,
      required: true,
    },
    longitude: {
      type: Number,
      required: true,
    },
    zone: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Zone",
      default: null,
    },
    status: {
      type: String,
      enum: [
        "PENDING",
        "APPROVED",
        "REJECTED",
        "ASSIGNED",
        "IN_PROGRESS",
        "RESOLVED",
      ],
      default: "PENDING",
    },
    aiVerified: {
      type: Boolean,
      default: false,
    },
    aiConfidence: {
      type: Number,
      default: 0,
    },
    aiDetectedIssue: {
      type: String,
      default: null,
    },
    beforeImage: {
      type: String,
      default: null,
    },
    afterImage: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// Index for efficient queries
complaintSchema.index({ zone: 1, status: 1 });
complaintSchema.index({ user: 1 });
complaintSchema.index({ createdAt: -1 });

export default mongoose.model("Complaint", complaintSchema);
