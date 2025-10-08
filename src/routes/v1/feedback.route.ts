import { Router } from 'express';
import feedbackController from '../../controllers/feedback.controller';
import { authenticate, authorize } from '../../middlewares/auth';
import { validate } from '../../middlewares/validate';
import { createFeedbackSchema } from '../../validators/feedback.validator';
import { uploadImage, handleUploadError } from '../../middlewares/upload';
import { UserRole } from '../../models/user';

const router = Router();

router.use(authenticate);

router.post(
  '/',
  uploadImage,
  handleUploadError,
  validate(createFeedbackSchema),
  feedbackController.createFeedback
);
router.get('/', feedbackController.getFeedbacks);
router.get('/:id', feedbackController.getFeedback);
router.delete('/:id', feedbackController.deleteFeedback);
router.get('/analytics', authorize(UserRole.ADMIN), feedbackController.getFeedbackAnalytics);

export default router;
