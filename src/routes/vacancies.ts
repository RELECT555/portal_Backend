import { Router } from 'express';
import * as vacanciesController from '../controllers/vacancies';

const router = Router();

router.get('/', vacanciesController.getVacancies);
router.get('/:id', vacanciesController.getVacancyById);

export default router;
