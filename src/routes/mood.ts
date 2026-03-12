import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as moodController from '../controllers/mood';

const router = Router();

router.get('/', authenticate, moodController.getEntries);
router.get('/stats', authenticate, moodController.getStats);
router.post('/', authenticate, moodController.createEntry);
router.patch('/:id', authenticate, moodController.updateEntry);
router.delete('/:id', authenticate, moodController.deleteEntry);

export default router;
