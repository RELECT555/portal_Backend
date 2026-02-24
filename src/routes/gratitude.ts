import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as gratitudeController from '../controllers/gratitude';

const router = Router();

router.get('/stats', gratitudeController.getStats);
router.get('/entries', gratitudeController.getEntries);
router.post('/', authenticate, gratitudeController.createGratitude);

export default router;
