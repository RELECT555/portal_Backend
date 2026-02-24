import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as postsController from '../controllers/posts';

const router = Router();

// Public routes
router.get('/', postsController.getPosts);
router.get('/:id', postsController.getPostById);

// Protected routes
router.post('/', authenticate, postsController.createPost);
router.put('/:id', authenticate, postsController.updatePost);
router.delete('/:id', authenticate, postsController.deletePost);
router.post('/:id/like', authenticate, postsController.likePost);
router.delete('/:id/like', authenticate, postsController.unlikePost);
router.post('/:id/comments', authenticate, postsController.addComment);
router.post('/:id/view', authenticate, postsController.recordView);

export default router;
