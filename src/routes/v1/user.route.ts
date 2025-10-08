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

// Update user (Admin only)
router.put('/:id', authorize(UserRole.ADMIN), userController.updateUser);

// Suspend user (Admin only)
router.post('/:id/suspend', authorize(UserRole.ADMIN), userController.suspendUser);

// Activate user (Admin only)
router.post('/:id/activate', authorize(UserRole.ADMIN), userController.activateUser);

// Delete user (Admin only)
router.delete('/:id', authorize(UserRole.ADMIN), userController.deleteUser);

export default router;
