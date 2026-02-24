import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as ideasController from '../controllers/ideas';

const router = Router();

router.get('/', ideasController.getIdeas);
router.post('/', authenticate, ideasController.createIdea);
router.post('/:id/vote', authenticate, ideasController.voteIdea);

export default router;
