import { Router } from 'express';
import {
  getMembers,
  createMember,
  updateMember,
  deleteMember
} from '../controllers/members.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getMembers);
router.post('/', createMember);
router.put('/:id', updateMember);
router.delete('/:id', deleteMember);

export default router;
