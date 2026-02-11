import mongoose from "mongoose";

const statusLogSchema = new mongoose.Schema(
  {
    complaint: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Complaint",
      required: true,
    },
    oldStatus: {
      type: String,
      required: true,
    },
    newStatus: {
      type: String,
      required: true,
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    note: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

statusLogSchema.index({ complaint: 1 });

export default mongoose.model("StatusLog", statusLogSchema);
