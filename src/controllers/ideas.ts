import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import type { IdeaStatus as PrismaIdeaStatus, IdeaCategory as PrismaIdeaCategory } from '@prisma/client';

const STATUS_TO_LOWER: Record<PrismaIdeaStatus, string> = {
  NEW: 'new',
  REVIEW: 'review',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  IMPLEMENTED: 'implemented',
};

const CATEGORY_TO_LOWER: Record<PrismaIdeaCategory, string> = {
  PROCESS: 'process',
  PRODUCT: 'product',
  CULTURE: 'culture',
  TECH: 'tech',
  OTHER: 'other',
};

const LOWER_TO_STATUS: Record<string, PrismaIdeaStatus> = {
  new: 'NEW',
  review: 'REVIEW',
  approved: 'APPROVED',
  rejected: 'REJECTED',
  implemented: 'IMPLEMENTED',
};

const LOWER_TO_CATEGORY: Record<string, PrismaIdeaCategory> = {
  process: 'PROCESS',
  product: 'PRODUCT',
  culture: 'CULTURE',
  tech: 'TECH',
  other: 'OTHER',
};

function formatIdea(
  idea: { id: string; title: string; description: string; status: PrismaIdeaStatus; category: PrismaIdeaCategory; tags: string[]; createdAt: Date; author?: { firstName: string; lastName: string; avatarUrl?: string | null } },
  votesCount: number,
  hasVoted?: boolean,
) {
  return {
    id: idea.id,
    title: idea.title,
    description: idea.description,
    status: STATUS_TO_LOWER[idea.status],
    category: CATEGORY_TO_LOWER[idea.category],
    tags: idea.tags ?? [],
    authorName: idea.author ? `${idea.author.firstName} ${idea.author.lastName}` : '',
    authorAvatar: idea.author?.avatarUrl ?? undefined,
    votesCount,
    commentsCount: 0,
    createdAt: idea.createdAt,
    hasVoted: !!hasVoted,
  };
}

export const getIdeas = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, category, page = '1', limit = '50' } = req.query;
    const userId = (req as any).user?.id;

    const pageNum = Math.max(1, parseInt(page as string));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string)));
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (status && typeof status === 'string' && LOWER_TO_STATUS[status.toLowerCase()]) {
      where.status = LOWER_TO_STATUS[status.toLowerCase()];
    }
    if (category && typeof category === 'string' && LOWER_TO_CATEGORY[category.toLowerCase()]) {
      where.category = LOWER_TO_CATEGORY[category.toLowerCase()];
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
          _count: { select: { votes: true } },
          votes: userId ? { where: { userId }, select: { id: true } } : false,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.idea.count({ where }),
    ]);

    const formattedIdeas = ideas.map((idea) => {
      const voteCount = idea._count?.votes ?? 0;
      const hasVoted = Array.isArray((idea as any).votes) && (idea as any).votes.length > 0;
      return formatIdea(idea, voteCount, hasVoted);
    });

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

export const getIdeasStats = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const [totalIdeas, implemented, inReview] = await Promise.all([
      prisma.idea.count(),
      prisma.idea.count({ where: { status: 'IMPLEMENTED' } }),
      prisma.idea.count({ where: { status: 'REVIEW' } }),
    ]);

    res.json({
      success: true,
      data: {
        totalIdeas,
        implemented,
        inReview,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createIdea = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, description, category, tags } = req.body;

    if (!title || !description) {
      throw new AppError('Title and description are required', 400);
    }

    const categoryValue =
      category && LOWER_TO_CATEGORY[String(category).toLowerCase()]
        ? LOWER_TO_CATEGORY[String(category).toLowerCase()]
        : 'OTHER';
    const tagsArray = Array.isArray(tags) ? tags.filter((t: any) => typeof t === 'string') : [];

    const idea = await prisma.idea.create({
      data: {
        title: String(title).trim(),
        description: String(description).trim(),
        category: categoryValue,
        tags: tagsArray,
        authorId: req.user!.id,
      },
      include: {
        author: {
          select: {
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
        _count: { select: { votes: true } },
      },
    });

    const formatted = formatIdea(idea, idea._count.votes, false);

    res.status(201).json({
      success: true,
      data: formatted,
      message: 'Idea created successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const updateIdeaStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;
    const rawStatus = req.body.status;
    const statusStr = typeof rawStatus === 'string' ? rawStatus : Array.isArray(rawStatus) ? rawStatus[0] : '';
    const statusLower = statusStr.toLowerCase();

    if (!statusStr || !LOWER_TO_STATUS[statusLower]) {
      throw new AppError('Valid status is required (new, review, approved, rejected, implemented)', 400);
    }

    const idea = await prisma.idea.findUnique({ where: { id } });
    if (!idea) {
      throw new AppError('Idea not found', 404);
    }

    const updated = await prisma.idea.update({
      where: { id },
      data: { status: LOWER_TO_STATUS[statusLower] },
      include: {
        author: {
          select: {
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
        _count: { select: { votes: true } },
      },
    });

    res.json({
      success: true,
      data: formatIdea(updated, updated._count.votes),
      message: 'Status updated',
    });
  } catch (error) {
    next(error);
  }
};

export const voteIdea = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;

    const idea = await prisma.idea.findUnique({ where: { id } });
    if (!idea) {
      throw new AppError('Idea not found', 404);
    }

    await prisma.ideaVote.create({
      data: {
        ideaId: id,
        userId: req.user!.id,
      },
    });

    const count = await prisma.ideaVote.count({ where: { ideaId: id } });

    res.json({
      success: true,
      data: { votesCount: count, hasVoted: true },
      message: 'Vote recorded successfully',
    });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return next(new AppError('Already voted', 400));
    }
    next(error);
  }
};

export const removeVote = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;

    await prisma.ideaVote.deleteMany({
      where: {
        ideaId: id,
        userId: req.user!.id,
      },
    });

    const count = await prisma.ideaVote.count({ where: { ideaId: id } });

    res.json({
      success: true,
      data: { votesCount: count, hasVoted: false },
      message: 'Vote removed',
    });
  } catch (error) {
    next(error);
  }
};
