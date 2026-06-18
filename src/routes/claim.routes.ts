import { Router } from 'express';
import { createClaimController, getClaimHistoryController } from '../controllers/claim.controller.js';
import { authenticateJWT, authorizeRoles } from '../middlewares/auth.middleware.js';
import { uploadFoto } from '../middlewares/upload.middleware.js';

const router = Router();

router.use(authenticateJWT, authorizeRoles('ADMIN'));
router.post('/process', uploadFoto.single('bukti_klaim'), createClaimController);
router.get('/history', getClaimHistoryController);

export default router;