import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';

export const getIdeas = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, page = '1', limit = '10' } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (status) {
      where.status = status;
    }

    const [ideas, total] = await Promise.all([
      prisma.idea.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
            },
          },
          _count: {
            select: {
              votes: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.idea.count({ where }),
    ]);

    const formattedIdeas = ideas.map((idea) => ({
      ...idea,
      authorName: `${idea.author.firstName} ${idea.author.lastName}`,
      votesCount: idea._count.votes,
      _count: undefined,
      author: undefined,
    }));

    res.json({
      success: true,
      data: formattedIdeas,
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

export const createIdea = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, description } = req.body;

    if (!title || !description) {
      throw new AppError('Title and description are required', 400);
    }

    const idea = await prisma.idea.create({
      data: {
        title,
        description,
        authorId: req.user!.id,
      },
    });

    res.status(201).json({
      success: true,
      data: idea,
      message: 'Idea created successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const voteIdea = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    await prisma.ideaVote.create({
      data: {
        ideaId: id,
        userId: req.user!.id,
      },
    });

    res.json({
      success: true,
      message: 'Vote recorded successfully',
    });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return next(new AppError('Already voted', 400));
    }
    next(error);
  }
};
