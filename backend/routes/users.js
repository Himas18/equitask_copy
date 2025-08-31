import express from "express";
import User from "../models/User.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ Get all users (team list)
router.get("/", verifyToken, async (req, res) => {
  try {
    const users = await User.find().select("-password"); // don’t send password
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Update profile (self or lead)
router.patch("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.id !== id && req.user.role !== "lead") {
      return res.status(403).json({ error: "Not allowed" });
    }

    const updates = req.body;
    const user = await User.findByIdAndUpdate(id, updates, { new: true }).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
