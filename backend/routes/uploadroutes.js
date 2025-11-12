// backend/src/routes/upload.routes.js
import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();

// Ensure uploads folder exists
const uploadDir = path.resolve("uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// Configure multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// Route to upload a single file
router.post("/", upload.single("file"), (req, res) => {
  res.json({
    message: "✅ File uploaded successfully!",
    filePath: `/uploads/${req.file.filename}`,
  });
});

export default router;
