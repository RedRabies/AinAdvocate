// backend/server.js
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch(err => console.error("❌ MongoDB connection failed:", err));

// Routes
import caseRoutes from "./src/routes/case.routes.js";
import userRoutes from "./src/routes/user.routes.js";
import uploadRoutes from "./routes/upload.routes.js";

app.use("/api/cases", caseRoutes);
app.use("/api/users", userRoutes);
app.use("/api/uploads", uploadRoutes);

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
