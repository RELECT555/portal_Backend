import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import { z } from 'zod';

const createLiveSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string(),
  imageUrl: z.string().url().optional(),
  category: z.enum(['ALL', 'CORPORATE', 'SPORT', 'CREATIVE', 'VOLUNTEER', 'EVENTS']).optional(),
  tags: z.array(z.string()).optional(),
  isPinned: z.boolean().optional(),
});

const updateLiveSchema = createLiveSchema.partial();

export const getLivePublications = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { category, page = '1', limit = '12', tags } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (category && category !== 'ALL') {
      where.category = category;
    }

    if (tags) {
      const tagArray = (tags as string).split(',');
      where.tags = { hasSome: tagArray };
    }

    const [publications, total] = await Promise.all([
      prisma.livePublication.findMany({
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
              likes: true,
              hearts: true,
              comments: true,
              views: true,
            },
          },
        },
        orderBy: [{ isPinned: 'desc' }, { publishedAt: 'desc' }],
        skip,
        take: limitNum,
      }),
      prisma.livePublication.count({ where }),
    ]);

    const formattedPublications = publications.map((pub) => ({
      ...pub,
      authorName: `${pub.author.firstName} ${pub.author.lastName}`,
      authorAvatar: pub.author.avatarUrl,
      likesCount: pub._count.likes,
      heartsCount: pub._count.hearts,
      commentsCount: pub._count.comments,
      viewsCount: pub._count.views,
      _count: undefined,
      author: undefined,
    }));

    res.json({
      success: true,
      data: formattedPublications,
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

export const getLivePublicationById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const publication = await prisma.livePublication.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            position: true,
          },
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            likes: true,
            hearts: true,
            comments: true,
            views: true,
          },
        },
      },
    });

    if (!publication) {
      throw new AppError('Live publication not found', 404);
    }

    const formattedPublication = {
      ...publication,
      authorName: `${publication.author.firstName} ${publication.author.lastName}`,
      authorAvatar: publication.author.avatarUrl,
      likesCount: publication._count.likes,
      heartsCount: publication._count.hearts,
      commentsCount: publication._count.comments,
      viewsCount: publication._count.views,
      _count: undefined,
    };

    res.json({
      success: true,
      data: formattedPublication,
    });
  } catch (error) {
    next(error);
  }
};

export const createLivePublication = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validatedData = createLiveSchema.parse(req.body);

    const publication = await prisma.livePublication.create({
      data: {
        ...validatedData,
        authorId: req.user!.id,
        tags: validatedData.tags || [],
        category: validatedData.category || 'ALL',
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      data: publication,
      message: 'Live publication created successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new AppError('Validation error', 400));
    }
    next(error);
  }
};

export const updateLivePublication = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const validatedData = updateLiveSchema.parse(req.body);

    const existing = await prisma.livePublication.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new AppError('Live publication not found', 404);
    }

    if (existing.authorId !== req.user!.id) {
      throw new AppError('Unauthorized', 403);
    }

    const updated = await prisma.livePublication.update({
      where: { id },
      data: validatedData,
    });

    res.json({
      success: true,
      data: updated,
      message: 'Live publication updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const deleteLivePublication = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const existing = await prisma.livePublication.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new AppError('Live publication not found', 404);
    }

    if (existing.authorId !== req.user!.id) {
      throw new AppError('Unauthorized', 403);
    }

    await prisma.livePublication.delete({ where: { id } });

    res.json({
      success: true,
      message: 'Live publication deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const likeLivePublication = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    await prisma.like.create({
      data: {
        userId: req.user!.id,
        livePublicationId: id,
      },
    });

    res.json({
      success: true,
      message: 'Live publication liked successfully',
    });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return next(new AppError('Already liked', 400));
    }
    next(error);
  }
};

export const heartLivePublication = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    await prisma.heart.create({
      data: {
        userId: req.user!.id,
        livePublicationId: id,
      },
    });

    res.json({
      success: true,
      message: 'Heart added successfully',
    });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return next(new AppError('Already hearted', 400));
    }
    next(error);
  }
};

export const addComment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      throw new AppError('Comment content is required', 400);
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        authorId: req.user!.id,
        livePublicationId: id,
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      data: comment,
      message: 'Comment added successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const recordView = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    await prisma.liveView.upsert({
      where: {
        userId_livePublicationId: {
          userId: req.user!.id,
          livePublicationId: id,
        },
      },
      create: {
        userId: req.user!.id,
        livePublicationId: id,
      },
      update: {
        viewedAt: new Date(),
      },
    });

    res.json({
      success: true,
      message: 'View recorded',
    });
  } catch (error) {
    next(error);
  }
};
