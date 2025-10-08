import { Router } from 'express';
import settingsController from '../../controllers/settings.controller';
import { authenticate, authorize } from '../../middlewares/auth';
import { validate } from '../../middlewares/validate';
import { updateSettingsSchema } from '../../validators/settings.validator';
import { UserRole } from '../../models/user';

const router = Router();

router.use(authenticate);
router.use(authorize(UserRole.ADMIN));

router.get('/', settingsController.getSettings);
router.put('/', validate(updateSettingsSchema), settingsController.updateSettings);

export default router;
