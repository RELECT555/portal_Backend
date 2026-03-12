import { Router } from 'express';
import postsRouter from './posts';
import liveRouter from './live';
import newsRouter from './news';
import profileRouter from './profile';
import vacanciesRouter from './vacancies';
import libraryRouter from './library';
import ideasRouter from './ideas';
import gratitudeRouter from './gratitude';
import teamRouter from './team';
import moodRouter from './mood';

const router = Router();

// API routes
router.use('/posts', postsRouter);
router.use('/live', liveRouter);
router.use('/news', newsRouter);
router.use('/profile', profileRouter);
router.use('/vacancies', vacanciesRouter);
router.use('/library', libraryRouter);
router.use('/ideas', ideasRouter);
router.use('/gratitude', gratitudeRouter);
router.use('/team', teamRouter);
router.use('/mood', moodRouter);

export default router;
