import { Router } from 'express';
import authRoutes from './auth.route';
import bookRoutes from './book.route';
import borrowingRoutes from './borrowing.route';
import feedbackRoutes from './feedback.route';
import fileRoutes from './file.route';
import fineRoutes from './fine.route';
import groupRoutes from './group.route';
import notificationRoutes from './notification.route';
import reportRoutes from './report.route';
import settingsRoutes from './settings.route';
import userRoutes from './user.route';

const router = Router();

router.use('/auth', authRoutes);
router.use('/books', bookRoutes);
router.use('/borrowings', borrowingRoutes);
router.use('/feedbacks', feedbackRoutes);
router.use('/files', fileRoutes);
router.use('/fines', fineRoutes);
router.use('/groups', groupRoutes);
router.use('/notifications', notificationRoutes);
router.use('/reports', reportRoutes);
router.use('/settings', settingsRoutes);
router.use('/users', userRoutes);

export default router;
