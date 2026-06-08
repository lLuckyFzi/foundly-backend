import { Router } from 'express';
import { getMatchResultsController, receiveWebhookController } from '../controllers/matching.controller.js';
import { authenticateJWT } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/matches/:id_barang_hilang', authenticateJWT, getMatchResultsController);
router.post('/webhook', receiveWebhookController);

export default router;