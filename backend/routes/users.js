import express from "express";
import User from "../models/User.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Update profile (self or lead)
router.patch("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Only self or lead can update
    if (req.user.id !== id && req.user.role !== "lead") {
      return res.status(403).json({ error: "Not allowed" });
    }

    const updates = req.body; // { status: "available" }
    const user = await User.findByIdAndUpdate(id, updates, { new: true });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
