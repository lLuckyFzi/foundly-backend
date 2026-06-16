import { Router } from 'express';
import {
  createFoundReportController,
  getAllFoundReportsController,
  getFoundReportByIdController,
  deleteFoundReportController,
  getMyFoundReportsController
} from '../controllers/foundItem.controller.js';
import { authenticateJWT } from '../middlewares/auth.middleware.js';
import { uploadFoto } from '../middlewares/upload.middleware.js';

const router = Router();

// Rute Publik: Mengizinkan semua user melihat daftar barang yang telah ditemukan di pos kampus
router.get('/found', authenticateJWT, getAllFoundReportsController);
router.get('/found/me', authenticateJWT, getMyFoundReportsController);
router.get('/found/:id', authenticateJWT, getFoundReportByIdController);

// Rute Terproteksi: Wajib menyertakan token login JWT untuk membuat atau menghapus laporan penemuan
router.post('/found', authenticateJWT, uploadFoto.single('foto_barang'), createFoundReportController);
router.delete('/found/:id', authenticateJWT, deleteFoundReportController);

export default router;