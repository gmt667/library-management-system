import { Router } from 'express';
import {
  getAllTransactions,
  lookupBarcode,
  borrowBook,
  returnBook
} from '../controllers/transactions.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Secure all transactions routes
router.use(authenticate);

router.get('/', getAllTransactions);
router.get('/lookup/:barcode', lookupBarcode);
router.post('/borrow', borrowBook);
router.post('/return', returnBook);

export default router;
