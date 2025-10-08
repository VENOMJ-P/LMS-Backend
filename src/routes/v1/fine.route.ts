import { Router } from 'express';
import fineController from '../../controllers/fine.controller';
import { authenticate, authorize } from '../../middlewares/auth';
import { validate } from '../../middlewares/validate';
import { updateFineSchema } from '../../validators/fine.validator';
import { UserRole } from '../../models/user';

const router = Router();

router.use(authenticate);

router.get('/', fineController.getFines);
router.get('/:id', fineController.getFine);
router.post('/:id/pay', fineController.payFine);

// Admin only
router.post('/:id/waive', authorize(UserRole.ADMIN), fineController.waiveFine);
router.put(
  '/:id',
  authorize(UserRole.ADMIN),
  validate(updateFineSchema),
  fineController.updateFine
);

export default router;
