import { Router } from 'express';
import {
  getPendingVerificationsController,
  getVerificationDetailController,
  getVerificationHistoryController,
  processVerificationController,
  rollbackVerificationController
} from '../controllers/verification.controller.js';
import { authenticateJWT, authorizeRoles } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(authenticateJWT, authorizeRoles('ADMIN'));

router.get('/pending', getPendingVerificationsController);
router.get('/history', getVerificationHistoryController);
router.post('/process', processVerificationController);

router.get('/:id', getVerificationDetailController);
router.put('/:id/rollback', rollbackVerificationController);

export default router;