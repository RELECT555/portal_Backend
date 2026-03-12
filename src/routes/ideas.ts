import { Router } from 'express';
import { authenticate, optionalAuth } from '../middleware/auth';
import * as ideasController from '../controllers/ideas';

const router = Router();

router.get('/', optionalAuth, ideasController.getIdeas);
router.get('/stats', ideasController.getIdeasStats);
router.post('/', authenticate, ideasController.createIdea);
router.patch('/:id', authenticate, ideasController.updateIdeaStatus);
router.post('/:id/vote', authenticate, ideasController.voteIdea);
router.delete('/:id/vote', authenticate, ideasController.removeVote);

export default router;
