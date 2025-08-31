// backend/routes/tasks.js
import express from "express";
import Task from "../models/Task.js";
import User from "../models/User.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ Get all tasks
router.get("/", verifyToken, async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate("assignee", "username email role")
      .populate("createdBy", "username email role");
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Create a new task (lead only)
router.post("/", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "lead") {
      return res.status(403).json({ error: "Only leads can create tasks" });
    }

    const { title, description, estimatedHours, priority, assignee, dueDate } = req.body;

    const task = new Task({
      title,
      description,
      estimatedHours,
      priority,
      assignee,
      createdBy: req.user.id,
      dueDate,
    });

    await task.save();
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Update a task (lead only)
router.put("/:id", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "lead") {
      return res.status(403).json({ error: "Only leads can update tasks" });
    }

    const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Update task status (employee or lead)
router.patch("/:id/status", verifyToken, async (req, res) => {
  try {
    const { status } = req.body;

    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: "Task not found" });

    // Employees can only update their own tasks
    if (req.user.role === "employee" && String(task.assignee) !== req.user.id) {
      return res.status(403).json({ error: "Not allowed" });
    }

    task.status = status;
    await task.save();

    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Delete a task (lead only)
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "lead") {
      return res.status(403).json({ error: "Only leads can delete tasks" });
    }

    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: "Task deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
