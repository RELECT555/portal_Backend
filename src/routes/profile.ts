import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as profileController from '../controllers/profile';

const router = Router();

router.get('/', authenticate, profileController.getCurrentUserProfile);
router.get('/:userId', authenticate, profileController.getUserProfile);
router.put('/', authenticate, profileController.updateProfile);
router.get('/:userId/stats', authenticate, profileController.getUserStats);

export default router;
