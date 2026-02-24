import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import { z } from 'zod';

// Validation schemas
const createPostSchema = z.object({
  type: z.enum(['NEWS', 'LIVE', 'IDEA', 'ANNOUNCEMENT', 'ARTICLE']),
  title: z.string().min(1).max(255),
  content: z.any(), // TipTap JSONContent
  contentHtml: z.string(),
  coverImageUrl: z.string().url().optional(),
  tags: z.array(z.string()).optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
  isMain: z.boolean().optional(),
  isPinned: z.boolean().optional(),
});

const updatePostSchema = createPostSchema.partial();

// Get all posts with filtering and pagination
export const getPosts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      type,
      status = 'PUBLISHED',
      page = '1',
      limit = '10',
      search,
      tags,
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {
      status: status as string,
    };

    if (type) {
      where.type = type;
    }

    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { contentHtml: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    if (tags) {
      const tagArray = (tags as string).split(',');
      where.tags = { hasSome: tagArray };
    }

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              position: true,
              avatarUrl: true,
            },
          },
          _count: {
            select: {
              likes: true,
              comments: true,
              views: true,
            },
          },
        },
        orderBy: [{ isPinned: 'desc' }, { publishedAt: 'desc' }],
        skip,
        take: limitNum,
      }),
      prisma.post.count({ where }),
    ]);

    const formattedPosts = posts.map((post) => ({
      ...post,
      authorName: `${post.author.firstName} ${post.author.lastName}`,
      authorAvatar: post.author.avatarUrl,
      likesCount: post._count.likes,
      commentsCount: post._count.comments,
      viewsCount: post._count.views,
      _count: undefined,
      author: undefined,
    }));

    res.json({
      success: true,
      data: formattedPosts,
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

// Get post by ID
export const getPostById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            position: true,
            department: true,
            avatarUrl: true,
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
            comments: true,
            views: true,
          },
        },
      },
    });

    if (!post) {
      throw new AppError('Post not found', 404);
    }

    const formattedPost = {
      ...post,
      authorName: `${post.author.firstName} ${post.author.lastName}`,
      authorAvatar: post.author.avatarUrl,
      likesCount: post._count.likes,
      commentsCount: post._count.comments,
      viewsCount: post._count.views,
      _count: undefined,
    };

    res.json({
      success: true,
      data: formattedPost,
    });
  } catch (error) {
    next(error);
  }
};

// Create post
export const createPost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = createPostSchema.parse(req.body);

    const post = await prisma.post.create({
      data: {
        ...validatedData,
        authorId: req.user!.id,
        tags: validatedData.tags || [],
        publishedAt:
          validatedData.status === 'PUBLISHED' ? new Date() : null,
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
      data: post,
      message: 'Post created successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new AppError('Validation error', 400));
    }
    next(error);
  }
};

// Update post
export const updatePost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const validatedData = updatePostSchema.parse(req.body);

    // Check if post exists and user is the author
    const existingPost = await prisma.post.findUnique({
      where: { id },
    });

    if (!existingPost) {
      throw new AppError('Post not found', 404);
    }

    if (existingPost.authorId !== req.user!.id) {
      throw new AppError('Unauthorized', 403);
    }

    const updatedPost = await prisma.post.update({
      where: { id },
      data: {
        ...validatedData,
        publishedAt:
          validatedData.status === 'PUBLISHED' && !existingPost.publishedAt
            ? new Date()
            : existingPost.publishedAt,
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

    res.json({
      success: true,
      data: updatedPost,
      message: 'Post updated successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new AppError('Validation error', 400));
    }
    next(error);
  }
};

// Delete post
export const deletePost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const existingPost = await prisma.post.findUnique({
      where: { id },
    });

    if (!existingPost) {
      throw new AppError('Post not found', 404);
    }

    if (existingPost.authorId !== req.user!.id) {
      throw new AppError('Unauthorized', 403);
    }

    await prisma.post.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Post deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Like post
export const likePost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) {
      throw new AppError('Post not found', 404);
    }

    await prisma.like.create({
      data: {
        userId: req.user!.id,
        postId: id,
      },
    });

    res.json({
      success: true,
      message: 'Post liked successfully',
    });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return next(new AppError('Already liked', 400));
    }
    next(error);
  }
};

// Unlike post
export const unlikePost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    await prisma.like.deleteMany({
      where: {
        userId: req.user!.id,
        postId: id,
      },
    });

    res.json({
      success: true,
      message: 'Post unliked successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Add comment
export const addComment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      throw new AppError('Comment content is required', 400);
    }

    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) {
      throw new AppError('Post not found', 404);
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        authorId: req.user!.id,
        postId: id,
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

// Record view
export const recordView = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) {
      throw new AppError('Post not found', 404);
    }

    await prisma.postView.upsert({
      where: {
        userId_postId: {
          userId: req.user!.id,
          postId: id,
        },
      },
      create: {
        userId: req.user!.id,
        postId: id,
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
