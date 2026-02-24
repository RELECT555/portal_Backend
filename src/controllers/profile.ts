import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';

export const getCurrentUserProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const profile = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: {
        manager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            position: true,
            department: true,
            avatarUrl: true,
          },
        },
        achievements: true,
      },
    });

    if (!profile) {
      throw new AppError('Profile not found', 404);
    }

    const stats = await getUserStatsData(req.user!.id);

    const formattedProfile = {
      ...profile,
      fullName: `${profile.firstName} ${profile.lastName}`,
      stats,
    };

    res.json({
      success: true,
      data: formattedProfile,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;

    const profile = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        manager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            position: true,
            department: true,
            avatarUrl: true,
          },
        },
        achievements: true,
      },
    });

    if (!profile) {
      throw new AppError('User not found', 404);
    }

    const stats = await getUserStatsData(userId);

    const formattedProfile = {
      ...profile,
      fullName: `${profile.firstName} ${profile.lastName}`,
      stats,
    };

    res.json({
      success: true,
      data: formattedProfile,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { bio, location, telegram, skills } = req.body;

    const updated = await prisma.user.update({
      where: { id: req.user!.id },
      data: {
        bio,
        location,
        telegram,
        skills,
      },
    });

    res.json({
      success: true,
      data: updated,
      message: 'Profile updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const getUserStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;

    const stats = await getUserStatsData(userId);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

// Helper function
async function getUserStatsData(userId: string) {
  const [
    postsCount,
    ideasCount,
    gratitudesSentCount,
    gratitudesReceivedCount,
    booksReadCount,
  ] = await Promise.all([
    prisma.post.count({ where: { authorId: userId } }),
    prisma.idea.count({ where: { authorId: userId } }),
    prisma.gratitude.count({ where: { fromId: userId } }),
    prisma.gratitude.count({ where: { toId: userId } }),
    prisma.bookBorrowing.count({
      where: { userId, returnedAt: { not: null } },
    }),
  ]);

  return {
    postsCount,
    ideasCount,
    gratitudesSentCount,
    gratitudesReceivedCount,
    booksReadCount,
    eventsAttendedCount: 0, // TODO: implement events
  };
}
