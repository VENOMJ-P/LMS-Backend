import { Router } from 'express';
import userController from '../../controllers/user.controller';
import { authenticate, authorize } from '../../middlewares/auth';
import { UserRole } from '../../models/user';

const router = Router();

// All user routes require authentication
router.use(authenticate);

// Get all users (Admin only)
router.get('/', authorize(UserRole.ADMIN), userController.getAllUsers);

// Get specific user
router.get('/:id', authorize(UserRole.ADMIN), userController.getUser);

// Update user (Admin only for role/status, self for other fields)
router.put('/:id', authorize(UserRole.ADMIN), userController.updateUser);

// Block user (Admin only)
router.post('/:id/block', authorize(UserRole.ADMIN), userController.blockUser);

// Unblock user (Admin only)
router.post('/:id/unblock', authorize(UserRole.ADMIN), userController.unblockUser);

// Delete user (Admin only)
router.delete('/:id', authorize(UserRole.ADMIN), userController.deleteUser);

export default router;
