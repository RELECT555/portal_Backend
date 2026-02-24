import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';

export const getTeamMembers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { department, search, page = '1', limit = '20' } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (department) {
      where.department = department;
    }

    if (search) {
      where.OR = [
        { firstName: { contains: search as string, mode: 'insensitive' } },
        { lastName: { contains: search as string, mode: 'insensitive' } },
        { position: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [members, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          position: true,
          department: true,
          phone: true,
          avatarUrl: true,
          birthDate: true,
          hireDate: true,
        },
        orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
        skip,
        take: limitNum,
      }),
      prisma.user.count({ where }),
    ]);

    const formattedMembers = members.map((member) => ({
      ...member,
      fullName: `${member.firstName} ${member.lastName}`,
    }));

    res.json({
      success: true,
      data: formattedMembers,
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

export const getTeamMember = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.params;

    const member = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        manager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            position: true,
            avatarUrl: true,
          },
        },
        subordinates: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            position: true,
            avatarUrl: true,
          },
        },
      },
    });

    if (!member) {
      throw new AppError('Team member not found', 404);
    }

    const formattedMember = {
      ...member,
      fullName: `${member.firstName} ${member.lastName}`,
    };

    res.json({
      success: true,
      data: formattedMember,
    });
  } catch (error) {
    next(error);
  }
};
