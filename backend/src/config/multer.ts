import multer from "multer";
import path from "path";
import fs from "fs";

const UPLOAD_DIR = path.resolve("uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
]);
const MAX_SIZE_MB = 10;

/**
 * Sanitiza el nombre original del archivo para que sea legible, limpio y amigable para SEO.
 * NO utiliza hashes UUID o MD5. Si el archivo ya existe, añade un sufijo numérico (-1, -2).
 */
function sanitizeFilename(originalName: string, destDir: string): string {
  const ext = path.extname(originalName).toLowerCase() || ".jpg";
  const base = path.basename(originalName, ext);

  // Normaliza eliminando acentos, caracteres especiales y convierte espacios a guiones
  let clean = base
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  if (!clean) clean = "imagen";

  let finalName = `${clean}${ext}`;
  let counter = 1;
  while (fs.existsSync(path.join(destDir, finalName))) {
    finalName = `${clean}-${counter}${ext}`;
    counter++;
  }
  return finalName;
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const safeName = sanitizeFilename(file.originalname, UPLOAD_DIR);
    cb(null, safeName);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: MAX_SIZE_MB * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME.has(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Tipo de archivo no permitido: ${file.mimetype}`));
    }
  },
});
