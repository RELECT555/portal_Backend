import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as libraryController from '../controllers/library';

const router = Router();

router.get('/books', libraryController.getBooks);
router.get('/books/:id', libraryController.getBookById);
router.post('/books/:id/borrow', authenticate, libraryController.borrowBook);
router.post('/books/:id/return', authenticate, libraryController.returnBook);

export default router;
