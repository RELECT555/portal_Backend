import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as liveController from '../controllers/live';

const router = Router();

// Public routes
router.get('/', liveController.getLivePublications);
router.get('/:id', liveController.getLivePublicationById);

// Protected routes
router.post('/', authenticate, liveController.createLivePublication);
router.put('/:id', authenticate, liveController.updateLivePublication);
router.delete('/:id', authenticate, liveController.deleteLivePublication);
router.post('/:id/like', authenticate, liveController.likeLivePublication);
router.post('/:id/heart', authenticate, liveController.heartLivePublication);
router.post('/:id/comments', authenticate, liveController.addComment);
router.post('/:id/view', authenticate, liveController.recordView);

export default router;
