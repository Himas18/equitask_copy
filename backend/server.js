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
app.use(express.json());

// --- CORS ---
const codespacesId = "crispy-trout-r96gv7pgx4g35qqq"; // <-- your Codespaces id prefix
const codespacesRegex = new RegExp(
  `^https://${codespacesId}-\\d+\\.app\\.github\\.dev$`
);

const staticAllowed = new Set([
  process.env.FRONTEND_URL, // optional, e.g. https://myapp.vercel.app
  "https://crispy-trout-r96gv7pgx4g35qqq-5173.app.github.dev",
  "https://crispy-trout-r96gv7pgx4g35qqq-8080.app.github.dev",
].filter(Boolean)); // drop undefined

const corsOptions = {
  origin(origin, cb) {
    // allow non-browser tools (no Origin header)
    if (!origin) return cb(null, true);

    if (staticAllowed.has(origin) || codespacesRegex.test(origin)) {
      return cb(null, true);
    }
    return cb(new Error(`Not allowed by CORS: ${origin}`));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: false, // set true ONLY if you use cookies for auth
};

// Apply CORS for all requests + preflight
app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // important for preflight

// --- Routes ---
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/tasks", taskRoutes);
app.use("/analytics", analyticsRoutes);
app.use("/notifications", notificationRoutes);

app.get("/", (_req, res) => {
  res.send("✅ EquiTask MERN backend is running!");
});

// --- DB + Server ---
const PORT = process.env.PORT || 3000;
mongoose
  .connect(process.env.MONGO_URI)
  .then(() =>
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`✅ Server running on port ${PORT}`);
    })
  )
  .catch((err) => console.error("❌ DB connection failed:", err));
