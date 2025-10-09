import { Router } from 'express';
import settingsController from '../../controllers/settings.controller';
import { authenticate, authorize } from '../../middlewares/auth';
import { validate } from '../../middlewares/validate';
import { updateSettingsSchema } from '../../validators/settings.validator';
import { UserRole } from '../../models/user';

const router = Router();

router.use(authenticate);

router.get('/', settingsController.getSettings);
router.put(
  '/',
  authorize(UserRole.ADMIN),
  validate(updateSettingsSchema),
  settingsController.updateSettings
);

export default router;
