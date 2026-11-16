// Genera y sirve variantes WebP de /uploads bajo demanda.
// Si la variante no existe, la crea con ffmpeg a partir del original (jpg/png).
// Si no puede generarla, redirige al original para que la imagen nunca se rompa.
const path = require("path");
const fs = require("fs");
const { execFile } = require("child_process");

const RAIZ = path.resolve(path.join(__dirname, "..", "uploads"));
const EXT_ORIGINALES = [".jpg", ".jpeg", ".png"];
const enProceso = new Set();

// Resuelve una ruta pedida dentro de uploads evitando salir del directorio.
function rutaSegura(urlPath) {
  const limpia = decodeURIComponent(urlPath).replace(/^\/+/, "");
  const destino = path.resolve(RAIZ, limpia);
  if (destino !== RAIZ && !destino.startsWith(RAIZ + path.sep)) return null;
  return destino;
}

// Busca el archivo original sin distinguir mayusculas (AMELIA1.JPG, amelia1.jpg...).
function buscarOriginal(rutaWebp) {
  const base = rutaWebp.replace(/\.webp$/i, "");
  const dir = path.dirname(base);
  const nombre = path.basename(base).toLowerCase();

  for (const ext of EXT_ORIGINALES) {
    const directo = base + ext;
    if (fs.existsSync(directo)) return directo;
  }

  try {
    const archivo = fs
      .readdirSync(dir)
      .find((f) => EXT_ORIGINALES.includes(path.extname(f).toLowerCase()) &&
                  path.basename(f, path.extname(f)).toLowerCase() === nombre);
    return archivo ? path.join(dir, archivo) : null;
  } catch {
    return null;
  }
}

function convertir(origen, destino) {
  return new Promise((resolve) => {
    // libwebp: buena relacion calidad/peso para fotos de catalogo.
    execFile(
      "ffmpeg",
      ["-y", "-loglevel", "error", "-i", origen, "-c:v", "libwebp",
       "-quality", "78", "-compression_level", "4", "-preset", "picture", destino],
      { timeout: 20000 },
      (error) => resolve(!error && fs.existsSync(destino))
    );
  });
}

module.exports = function webpBajoDemanda(req, res, next) {
  const pedido = req.path;
  if (!pedido.toLowerCase().endsWith(".webp")) return next();

  const destino = rutaSegura(pedido);
  if (!destino) return next();

  // Ya existe: que la sirva express.static
  if (fs.existsSync(destino)) return next();

  const origen = buscarOriginal(destino);
  if (!origen) return next(); // sin original: 404 normal

  const urlOriginal = "/uploads/" +
    path.relative(RAIZ, origen).split(path.sep).map(encodeURIComponent).join("/");

  if (enProceso.has(destino)) return res.redirect(302, urlOriginal);

  enProceso.add(destino);
  convertir(origen, destino).then((ok) => {
    enProceso.delete(destino);
    if (ok) {
      res.set("Cache-Control", "public, max-age=604800");
      return next();
    }
    // No se pudo convertir: el navegador recibe la original y la imagen funciona.
    return res.redirect(302, urlOriginal);
  });
};
