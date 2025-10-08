import { Router } from 'express';
import notificationController from '../../controllers/notification.controller';
import { authenticate } from '../../middlewares/auth';

const router = Router();

router.use(authenticate);

router.get('/', notificationController.getNotifications);
router.post('/:id/read', notificationController.markAsRead);
router.post('/read-all', notificationController.markAllAsRead);

export default router;
