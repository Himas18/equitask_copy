import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import taskRoutes from "./routes/tasks.js";
import analyticsRoutes from "./routes/analytics.js";
import notificationRoutes from "./routes/notifications.js";

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_URL || "https://crispy-trout-r96gv7pgx4g35qqq-5173.app.github.dev",
  credentials: true,
}));

// Routes
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/tasks", taskRoutes);
app.use("/analytics", analyticsRoutes);
app.use("/notifications", notificationRoutes);

// Root check
app.get("/", (req, res) => {
  res.send("✅ EquiTask MERN backend is running!");
});

// DB + server
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() =>
    app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`))
  )
  .catch((err) => console.error("❌ DB connection failed:", err));
