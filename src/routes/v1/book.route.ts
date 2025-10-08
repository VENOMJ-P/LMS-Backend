import { Router } from 'express';
import bookController from '../../controllers/book.controller';
import { authenticate, authorize } from '../../middlewares/auth';
import { validate } from '../../middlewares/validate';
import { createBookSchema, updateBookSchema } from '../../validators/book.validator';
import { uploadCsv, handleUploadError } from '../../middlewares/upload';
import { UserRole } from '../../models/user';

const router = Router();

router.use(authenticate);

router.get('/', bookController.getBooks);
router.get('/:id', bookController.getBook);

// Admin only
router.post('/', authorize(UserRole.ADMIN), validate(createBookSchema), bookController.createBook);
router.put(
  '/:id',
  authorize(UserRole.ADMIN),
  validate(updateBookSchema),
  bookController.updateBook
);
router.delete('/:id', authorize(UserRole.ADMIN), bookController.deleteBook);
router.post(
  '/bulk',
  authorize(UserRole.ADMIN),
  uploadCsv,
  handleUploadError,
  bookController.bulkUpload
);

export default router;
