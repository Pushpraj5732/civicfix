import mongoose from "mongoose";

const zoneSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Zone name is required"],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    head: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Zone", zoneSchema);
