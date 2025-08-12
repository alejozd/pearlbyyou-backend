const multer = require("multer");
const path = require("path");

// Configuración de multer para guardar los archivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // La ruta de subida en tu servidor remoto
    cb(null, path.join(__dirname, "../uploads/"));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 1000000 }, // Límite de 1MB por archivo
});

module.exports = upload;
