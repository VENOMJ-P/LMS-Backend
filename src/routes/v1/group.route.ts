import { Router } from 'express';
import groupController from '../../controllers/group.controller';
import { authenticate, authorize } from '../../middlewares/auth';
import { validate } from '../../middlewares/validate';
import { createGroupSchema, updateGroupSchema } from '../../validators/group.validator';
import { UserRole } from '../../models/user';

const router = Router();

router.use(authenticate);

router.post('/', validate(createGroupSchema), groupController.createGroup);
router.get('/', groupController.getGroups);
router.get('/:id', groupController.getGroup);
router.put('/:id', validate(updateGroupSchema), groupController.updateGroup);

// Admin only
router.post('/:id/approve', authorize(UserRole.ADMIN), groupController.approveGroup);
router.post('/:id/reject', authorize(UserRole.ADMIN), groupController.rejectGroup);
router.delete('/:id', authorize(UserRole.ADMIN), groupController.dissolveGroup);

export default router;
