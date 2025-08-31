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
app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL,
      "https://crispy-trout-r96gv7pgx4g35qqq-5173.app.github.dev",
       "https://crispy-trout-r96gv7pgx4g35qqq-8080.app.github.dev" // ✅ add this
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: false,
  })
);


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

// DB + Server
const PORT = process.env.PORT || 3000; // ✅ Codespaces defaults to 8080

mongoose
  .connect(process.env.MONGO_URI)
  .then(() =>
    app.listen(PORT, "0.0.0.0", () => {
      // ✅ bind to 0.0.0.0 so Codespaces proxy can see it
      console.log(`✅ Server running on port ${PORT}`);
    })
  )
  .catch((err) => console.error("❌ DB connection failed:", err));
