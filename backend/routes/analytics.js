import express from "express";
import Task from "../models/Task.js";
import User from "../models/User.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Weekly report summary
router.get("/weekly-report", verifyToken, async (req, res) => {
  try {
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const tasks = await Task.find({
      createdAt: { $gte: startOfWeek, $lte: endOfWeek },
    }).populate("assignee", "name");

    const teamMembers = await User.find();

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === "completed").length;
    const overdueTasks = tasks.filter((t) => t.status === "overdue").length;

    // Top performers
    const perfMap = {};
    tasks.forEach((task) => {
      if (task.status === "completed" && task.assignee?.name) {
        perfMap[task.assignee.name] = (perfMap[task.assignee.name] || 0) + 1;
      }
    });

    const topPerformers = Object.entries(perfMap)
      .map(([name, completedTasks]) => ({ name, completedTasks }))
      .sort((a, b) => b.completedTasks - a.completedTasks)
      .slice(0, 3);

    res.json({
      totalTasks,
      completedTasks,
      overdueTasks,
      averageCompletionTime: 0, // TODO: calculate if you track completion timestamps
      teamUtilization: teamMembers.length ? completedTasks / teamMembers.length : 0,
      topPerformers,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
