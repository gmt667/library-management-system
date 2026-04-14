import { Router } from 'express';
import {
  getAllPayments,
  recordPayment
} from '../controllers/payments.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getAllPayments);
router.post('/', recordPayment);

export default router;
