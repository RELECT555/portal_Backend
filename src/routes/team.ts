import { Router } from 'express';
import * as teamController from '../controllers/team';

const router = Router();

router.get('/', teamController.getTeamMembers);
router.get('/:userId', teamController.getTeamMember);

export default router;
