import express from 'express';

import auth from './auth.route';
import user from './user.route';
import book from './book.route';

const router = express.Router();

router.use('/auth', auth);
router.use('/users', user);
router.use('/books', book);

export default router;
