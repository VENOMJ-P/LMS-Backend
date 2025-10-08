import { Router } from 'express';
import reportController from '../../controllers/report.controller';
import { authenticate, authorize } from '../../middlewares/auth';
import { UserRole } from '../../models/user';

const router = Router();

router.use(authenticate);
router.use(authorize(UserRole.ADMIN));

router.get('/', reportController.generateReport);

export default router;
