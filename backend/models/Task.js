import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    estimatedHours: { type: Number, default: 0 },
    priority: { type: String, enum: ["urgent", "high", "medium", "low"], default: "medium" },
    status: { type: String, enum: ["pending", "in_progress", "completed", "overdue"], default: "pending" },
    assignee: { type: mongoose.Schema.Types.ObjectId, ref: "User" },  // ✅ must match populate()
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // ✅ must match populate()
    dueDate: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model("Task", taskSchema);
