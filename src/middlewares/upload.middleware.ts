import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '_' + Math.round(Math.random() * 1E4);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `foundly_img_${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedExtensions = /jpeg|jpg|png/;
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png'];

  const extCheck = allowedExtensions.test(path.extname(file.originalname).toLowerCase());
  const mimeCheck = allowedMimeTypes.includes(file.mimetype);

  if (extCheck && mimeCheck) {
    return cb(null, true);
  } else {
    return cb(new Error('Akses ditolak! Format file tidak didukung. Hanya boleh mengunggah gambar (JPG, JPEG, PNG).') as any, false);
  }
};

export const uploadFoto = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024
  }
});