// controllers/uploadController.js
const path = require("path");

exports.uploadFile = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded!" });
    }

    res.status(200).json({
      message: "File uploaded successfully!",
      filePath: `/uploads/${req.file.filename}`,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
