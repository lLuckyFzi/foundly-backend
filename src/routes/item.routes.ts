import { Router } from 'express';
import { 
  createLostReportController, 
  getAllLostReportsController,
  getLostReportByIdController,
  deleteLostReportController,
  getMyLostReportsController
} from '../controllers/item.controller.js';
import { authenticateJWT } from '../middlewares/auth.middleware.js';
import { uploadFoto } from '../middlewares/upload.middleware.js';

const router = Router();

// Rute Publik: Siapapun (termasuk yang belum login) bisa melihat barang yang hilang di kampus
router.get('/lost', authenticateJWT, getAllLostReportsController);
router.get('/lost/me', authenticateJWT, getMyLostReportsController);
router.get('/lost/:id', authenticateJWT, getLostReportByIdController);

// Rute Terproteksi: Harus login untuk membuat atau menghapus laporan barang hilang
router.post('/lost', authenticateJWT, uploadFoto.single('foto_barang'), createLostReportController);
router.delete('/lost/:id', authenticateJWT, deleteLostReportController);

export default router;