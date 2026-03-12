import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';

const MOOD_VALUES = ['great', 'good', 'okay', 'bad', 'awful'] as const;

const MOOD_TO_DB: Record<string, string> = {
  great: 'GREAT',
  good: 'GOOD',
  okay: 'OKAY',
  bad: 'BAD',
  awful: 'AWFUL',
};

const DB_TO_MOOD: Record<string, string> = {
  GREAT: 'great',
  GOOD: 'good',
  OKAY: 'okay',
  BAD: 'bad',
  AWFUL: 'awful',
};

function formatEntry(entry: any) {
  return {
    id: entry.id,
    mood: DB_TO_MOOD[entry.mood] ?? entry.mood,
    note: entry.note,
    tags: entry.tags,
    recordedAt: entry.recordedAt,
    createdAt: entry.createdAt,
  };
}

export const getEntries = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { page = '1', limit = '50', from, to } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = { userId };

    if (from || to) {
      where.recordedAt = {};
      if (from) where.recordedAt.gte = new Date(from as string);
      if (to) where.recordedAt.lte = new Date(to as string);
    }

    const [entries, total] = await Promise.all([
      prisma.moodEntry.findMany({
        where,
        orderBy: { recordedAt: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.moodEntry.count({ where }),
    ]);

    res.json({
      success: true,
      data: entries.map(formatEntry),
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

export const getStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;

    const [totalCount, thisWeekEntries, thisMonthEntries, moodCounts] = await Promise.all([
      prisma.moodEntry.count({ where: { userId } }),
      prisma.moodEntry.findMany({
        where: {
          userId,
          recordedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
        select: { mood: true },
      }),
      prisma.moodEntry.findMany({
        where: {
          userId,
          recordedAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        },
        select: { mood: true },
      }),
      prisma.moodEntry.groupBy({
        by: ['mood'],
        where: { userId },
        _count: { mood: true },
      }),
    ]);

    const distribution: Record<string, number> = {};
    for (const item of moodCounts) {
      distribution[DB_TO_MOOD[item.mood] ?? item.mood] = item._count.mood;
    }

    const currentStreak = await calculateStreak(userId);

    res.json({
      success: true,
      data: {
        totalEntries: totalCount,
        thisWeek: thisWeekEntries.length,
        thisMonth: thisMonthEntries.length,
        streak: currentStreak,
        distribution,
      },
    });
  } catch (error) {
    next(error);
  }
};

async function calculateStreak(userId: string): Promise<number> {
  const entries = await prisma.moodEntry.findMany({
    where: { userId },
    orderBy: { recordedAt: 'desc' },
    select: { recordedAt: true },
    take: 60,
  });

  if (entries.length === 0) return 0;

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const entryDates = new Set(
    entries.map((e) => {
      const d = new Date(e.recordedAt);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    }),
  );

  const checkDate = new Date(today);
  if (!entryDates.has(checkDate.getTime())) {
    checkDate.setDate(checkDate.getDate() - 1);
  }

  while (entryDates.has(checkDate.getTime())) {
    streak++;
    checkDate.setDate(checkDate.getDate() - 1);
  }

  return streak;
}

export const createEntry = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { mood, note, tags } = req.body;

    if (!mood || !MOOD_VALUES.includes(mood)) {
      throw new AppError('Valid mood value is required (great, good, okay, bad, awful)', 400);
    }

    const entry = await prisma.moodEntry.create({
      data: {
        userId,
        mood: MOOD_TO_DB[mood] as any,
        note: note || null,
        tags: tags || [],
      },
    });

    res.status(201).json({
      success: true,
      data: formatEntry(entry),
      message: 'Mood entry created',
    });
  } catch (error) {
    next(error);
  }
};

export const updateEntry = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { mood, note, tags } = req.body;

    const existing = await prisma.moodEntry.findUnique({ where: { id } });
    if (!existing) throw new AppError('Entry not found', 404);
    if (existing.userId !== userId) throw new AppError('Forbidden', 403);

    const data: any = {};
    if (mood && MOOD_VALUES.includes(mood)) data.mood = MOOD_TO_DB[mood];
    if (note !== undefined) data.note = note || null;
    if (tags !== undefined) data.tags = tags;

    const entry = await prisma.moodEntry.update({ where: { id }, data });

    res.json({
      success: true,
      data: formatEntry(entry),
      message: 'Mood entry updated',
    });
  } catch (error) {
    next(error);
  }
};

export const deleteEntry = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const existing = await prisma.moodEntry.findUnique({ where: { id } });
    if (!existing) throw new AppError('Entry not found', 404);
    if (existing.userId !== userId) throw new AppError('Forbidden', 403);

    await prisma.moodEntry.delete({ where: { id } });

    res.json({ success: true, message: 'Mood entry deleted' });
  } catch (error) {
    next(error);
  }
};
