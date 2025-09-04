import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // hashed
    role: { type: String, enum: ["employee", "lead"], default: "employee" },
    skills: { type: [String], default: [] },
    status: { type: String, enum: ["available", "busy"], default: "available" },
    weeklyCapacityHours: { type: Number, default: 40 },
    notificationPrefs: {
      email: { type: Boolean, default: true },
      inApp: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
