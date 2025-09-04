import express from "express";
import Task from "../models/Task.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ Get tasks
router.get("/", verifyToken, async (req, res) => {
  try {
    let tasks;

    if (req.user.role === "employee") {
      // employee sees only own tasks
      tasks = await Task.find({ assignee: req.user.id }).populate("assignee", "username email role");
    } else {
      // lead sees all tasks
      tasks = await Task.find().populate("assignee", "username email role");
    }

    res.json({ tasks });   // <-- frontend expects wrapped response
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Create task (lead only)
router.post("/", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "lead") {
      return res.status(403).json({ error: "Only leads can create tasks" });
    }

    const task = new Task({ ...req.body, createdBy: req.user.id });
    await task.save();

    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
