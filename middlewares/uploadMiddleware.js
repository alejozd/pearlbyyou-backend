// backend/src/middlewares/uploadMiddleware.js

const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = path.join(__dirname, "../uploads");

// Asegura que el directorio 'uploads' exista
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ✅ Crea el subdirectorio 'bolsos' si no existe
const bolsosUploadDir = path.join(uploadDir, "bolsos");
if (!fs.existsSync(bolsosUploadDir)) {
  fs.mkdirSync(bolsosUploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // ✅ Guarda los archivos en el subdirectorio 'bolsos'
    cb(null, bolsosUploadDir);
  },
  filename: function (req, file, cb) {
    const sanitizedFilename = file.originalname
      .replace(/[^a-z0-9.]/gi, "_")
      .toLowerCase();
    cb(null, sanitizedFilename);
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5, // 5 MB
  },
});

module.exports = upload;
