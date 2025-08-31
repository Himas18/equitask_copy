import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

import authRoutes from "./routes/auth.js";
import taskRoutes from "./routes/tasks.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/tasks", taskRoutes);

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`)))
  .catch((err) => console.log("❌ DB Connection Failed", err));
