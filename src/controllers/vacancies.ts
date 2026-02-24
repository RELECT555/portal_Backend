import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';

export const getVacancies = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = '1', limit = '10' } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const [vacancies, total] = await Promise.all([
      prisma.vacancy.findMany({
        orderBy: [{ isHot: 'desc' }, { publishedAt: 'desc' }],
        skip,
        take: limitNum,
      }),
      prisma.vacancy.count(),
    ]);

    res.json({
      success: true,
      data: vacancies,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getVacancyById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const vacancy = await prisma.vacancy.findUnique({
      where: { id },
    });

    if (!vacancy) {
      throw new AppError('Vacancy not found', 404);
    }

    res.json({
      success: true,
      data: vacancy,
    });
  } catch (error) {
    next(error);
  }
};
