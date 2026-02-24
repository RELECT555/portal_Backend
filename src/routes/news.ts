import { Router } from 'express';
import { getPosts, getPostById } from '../controllers/posts';

const router = Router();

// News использует те же контроллеры что и posts, но фильтрует по type=NEWS
router.get('/', (req, res, next) => {
  req.query.type = 'NEWS';
  return getPosts(req, res, next);
});

router.get('/:id', getPostById);

export default router;
