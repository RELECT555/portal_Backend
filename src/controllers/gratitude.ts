import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';

export const getStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [totalCount, thisWeekCount, thisMonthCount] = await Promise.all([
      prisma.gratitude.count(),
      prisma.gratitude.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      prisma.gratitude.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    res.json({
      success: true,
      data: {
        totalCount,
        thisWeekCount,
        thisMonthCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getEntries = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = '1', limit = '10' } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const [entries, total] = await Promise.all([
      prisma.gratitude.findMany({
        include: {
          from: {
            select: {
              firstName: true,
              lastName: true,
              avatarUrl: true,
            },
          },
          to: {
            select: {
              firstName: true,
              lastName: true,
              position: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.gratitude.count(),
    ]);

    const formattedEntries = entries.map((entry) => ({
      id: entry.id,
      fromName: `${entry.from.firstName} ${entry.from.lastName}`,
      toName: `${entry.to.firstName} ${entry.to.lastName}`,
      toPosition: entry.to.position,
      message: entry.message,
      createdAt: entry.createdAt,
    }));

    res.json({
      success: true,
      data: formattedEntries,
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

export const createGratitude = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { toId, message } = req.body;

    if (!toId || !message) {
      throw new AppError('Recipient and message are required', 400);
    }

    const gratitude = await prisma.gratitude.create({
      data: {
        fromId: req.user!.id,
        toId,
        message,
      },
    });

    res.status(201).json({
      success: true,
      data: gratitude,
      message: 'Gratitude sent successfully',
    });
  } catch (error) {
    next(error);
  }
};
