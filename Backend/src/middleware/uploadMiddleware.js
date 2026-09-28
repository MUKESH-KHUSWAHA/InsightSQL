/**
 * Upload Middleware — configures multer for CSV file uploads.
 * 
 * - Uses memory storage (no disk writes)
 * - 5MB file size limit
 * - Only accepts .csv files (checks both mimetype and extension)
 */
const multer = require('multer');
const path = require('path');

// Configure multer with memory storage
const storage = multer.memoryStorage();

// File filter — only allow .csv files (by extension, regardless of mimetype)
function fileFilter(req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();

  // Accept only .csv files based on extension (mimetype varies by OS/browser)
  if (ext === '.csv') {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Only CSV files are accepted. Received: ${ext}`), false);
  }
}

// Export configured multer instance
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

module.exports = upload;
