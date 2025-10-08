import { Router } from 'express';
import borrowingController from '../../controllers/borrowing.controller';
import { authenticate, authorize } from '../../middlewares/auth';
import { validate } from '../../middlewares/validate';
import {
  createBorrowingSchema,
  returnBookSchema,
  extendDeadlineSchema
} from '../../validators/borrowing.validator';
import { UserRole } from '../../models/user';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Create borrowing
router.post('/', validate(createBorrowingSchema), borrowingController.createBorrowing);

// Get borrowings
router.get('/', borrowingController.getBorrowings);

// Get specific borrowing
router.get('/:id', borrowingController.getBorrowing);

// Return book
router.post('/:id/return', validate(returnBookSchema), borrowingController.returnBook);

// Admin-only routes
router.post(
  '/:id/extend',
  authorize(UserRole.ADMIN),
  validate(extendDeadlineSchema),
  borrowingController.extendDeadline
);
router.post('/:id/lost', authorize(UserRole.ADMIN), borrowingController.markAsLost);

export default router;
