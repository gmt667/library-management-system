import { Router } from 'express';
import {
  getBooks,
  createBook,
  updateBook,
  deleteBook,
  createCopy,
  deleteCopy
} from '../controllers/books.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Secure all books routes
router.use(authenticate);

router.get('/', getBooks);
router.post('/', createBook);
router.put('/:id', updateBook);
router.delete('/:id', deleteBook);

router.post('/:id/copies', createCopy);
router.delete('/copies/:copyId', deleteCopy);

export default router;
