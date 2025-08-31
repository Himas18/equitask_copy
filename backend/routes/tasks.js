import express from "express";
import Task from "../models/Task.js";
import User from "../models/User.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Suggest user for task assignment
router.post("/suggest", verifyToken, async (req, res) => {
  try {
    const { requiredSkills = [], estimatedHours = 0 } = req.body;

    const employees = await User.find({ role: "employee" });

    // Get all active tasks (pending, in_progress, overdue)
    const tasks = await Task.find({
      status: { $in: ["pending", "in_progress", "overdue"] },
    });

    const workloadMap = {};
    tasks.forEach((t) => {
      workloadMap[t.assignee] = (workloadMap[t.assignee] || 0) + (t.estimatedHours || 0);
    });

    const suggestions = employees.map((emp) => {
      const currentLoad = workloadMap[emp._id] || 0;
      const availableCapacity = (emp.weeklyCapacityHours || 40) - currentLoad;

      const skillMatchCount = requiredSkills.filter((s) =>
        emp.skills.includes(s)
      ).length;

      return {
        user_id: emp._id,
        name: emp.name,
        current_workload: currentLoad,
        available_capacity: availableCapacity,
        skill_match_count: skillMatchCount,
        status: emp.status || (currentLoad < (emp.weeklyCapacityHours || 40) ? "available" : "busy"),
      };
    });

    // Filter out employees who would exceed 40h
    const filtered = suggestions.filter((s) => s.current_workload + estimatedHours <= 40);

    // Sort: least workload → most skill matches → name
    filtered.sort((a, b) => {
      if (a.current_workload !== b.current_workload) return a.current_workload - b.current_workload;
      if (b.skill_match_count !== a.skill_match_count) return b.skill_match_count - a.skill_match_count;
      return a.name.localeCompare(b.name);
    });

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
