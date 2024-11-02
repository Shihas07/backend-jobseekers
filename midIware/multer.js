const multer = require("multer");
const path = require("path");

// Set up storage for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Set the upload directory
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname); // Create a unique filename
  },
});

// File type filter
const fileFilter = (req, file, cb) => {
  const filetypes = /pdf|doc|docx/; // Allowed file types
  const mimetype = filetypes.test(file.mimetype); // Check mime type
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase()); // Check extension

  if (mimetype && extname) {
    return cb(null, true); // Accept file
  }
  cb(new Error("Error: File type not allowed."), false); // Reject file
};

// Create Multer instance with storage and file filter
const uploadStorage = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5 MB
  fileFilter: fileFilter,
});

// Export the uploadStorage instance
module.exports = uploadStorage;
