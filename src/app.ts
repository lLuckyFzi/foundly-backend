import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from "url";

import adminRoutes from './routes/admin.routes.js';

import userRoutes from './routes/user.routes.js';
import authRoutes from './routes/auth.routes.js';
import itemRoutes from './routes/item.routes.js';
import claimRoutes from './routes/claim.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import matchingRoutes from './routes/matching.routes.js';
import foundItemRoutes from './routes/foundItem.routes.js';
import verificationRoutes from './routes/verification.routes.js';

import { initWhatsApp } from './utils/whatsapp.util.js';

const PORT = process.env.PORT || 5000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/v1/auth', authRoutes);

app.use('/api/v1/admin/verifications', verificationRoutes);
app.use('/api/v1/admin', adminRoutes);

app.use('/api/v1/users', userRoutes);

app.use('/api/v1/items', itemRoutes);
app.use('/api/v1/items-found', foundItemRoutes);

app.use('/api/v1/claims', claimRoutes);
app.use('/api/v1/matching', matchingRoutes);
app.use('/api/v1/notifications', notificationRoutes);

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`[Foundly Server Ready]: Running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode.`);
    
    initWhatsApp();
  });
}

export default app;