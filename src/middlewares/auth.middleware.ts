import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.util.js';

// Modifikasi tipe Request Express bawaan agar bisa menampung properti user global
declare global {
  namespace Express {
    interface Request {
      user?: {
        id_user: number;
        role: 'PUBLIC' | 'ADMIN';
      };
    }
  }
}

// Middleware 1: Memastikan User sudah Login (Punya token valid)
export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ status: false, message: 'Akses ditolak, token tidak disediakan' });
  }

  const token = authHeader.split(' ')[1]!;

  try {
    const decoded = verifyToken(token);
    req.user = decoded; // Menyisipkan data token ke dalam objek request
    next(); // Lanjut ke controller/middleware berikutnya
  } catch (error) {
    return res.status(403).json({ status: false, message: 'Token tidak valid atau kadaluwarsa' });
  }
};

// Middleware 2: Membatasi Hak Akses Berdasarkan Role (Authorization)
export const authorizeRoles = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ status: false, message: 'Tidak terautentikasi' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ status: false, message: 'Akses ditolak, Anda tidak memiliki izin untuk tindakan ini' });
    }

    next();
  };
};