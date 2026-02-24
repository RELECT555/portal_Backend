import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';

export const getBooks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { category, status, page = '1', limit = '12' } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (category) {
      where.category = category;
    }

    if (status) {
      where.status = status;
    }

    const [books, total] = await Promise.all([
      prisma.book.findMany({
        where,
        include: {
          reviews: true,
          borrowings: {
            where: { returnedAt: null },
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
          _count: {
            select: {
              reviews: true,
              borrowings: true,
            },
          },
        },
        orderBy: [{ isFeatured: 'desc' }, { addedAt: 'desc' }],
        skip,
        take: limitNum,
      }),
      prisma.book.count({ where }),
    ]);

    const formattedBooks = books.map((book) => {
      const avgRating =
        book.reviews.length > 0
          ? book.reviews.reduce((sum, r) => sum + r.rating, 0) / book.reviews.length
          : 0;

      const currentBorrowing = book.borrowings[0];

      return {
        ...book,
        rating: Math.round(avgRating * 10) / 10,
        reviewsCount: book._count.reviews,
        borrowCount: book._count.borrowings,
        borrowedBy: currentBorrowing
          ? `${currentBorrowing.user.firstName} ${currentBorrowing.user.lastName}`
          : undefined,
        returnDate: currentBorrowing?.returnDate,
        reviews: undefined,
        borrowings: undefined,
        _count: undefined,
      };
    });

    res.json({
      success: true,
      data: formattedBooks,
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

export const getBookById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const book = await prisma.book.findUnique({
      where: { id },
      include: {
        reviews: true,
        borrowings: {
          where: { returnedAt: null },
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    if (!book) {
      throw new AppError('Book not found', 404);
    }

    const avgRating =
      book.reviews.length > 0
        ? book.reviews.reduce((sum, r) => sum + r.rating, 0) / book.reviews.length
        : 0;

    const formattedBook = {
      ...book,
      rating: Math.round(avgRating * 10) / 10,
      reviewsCount: book.reviews.length,
    };

    res.json({
      success: true,
      data: formattedBook,
    });
  } catch (error) {
    next(error);
  }
};

export const borrowBook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const book = await prisma.book.findUnique({
      where: { id },
      include: {
        borrowings: {
          where: { returnedAt: null },
        },
      },
    });

    if (!book) {
      throw new AppError('Book not found', 404);
    }

    if (book.status !== 'AVAILABLE') {
      throw new AppError('Book is not available', 400);
    }

    // Создаём запись о взятии книги
    const returnDate = new Date();
    returnDate.setDate(returnDate.getDate() + 30); // 30 дней на чтение

    await prisma.$transaction([
      prisma.bookBorrowing.create({
        data: {
          bookId: id,
          userId: req.user!.id,
          returnDate,
        },
      }),
      prisma.book.update({
        where: { id },
        data: { status: 'BORROWED' },
      }),
    ]);

    res.json({
      success: true,
      message: 'Book borrowed successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const returnBook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const borrowing = await prisma.bookBorrowing.findFirst({
      where: {
        bookId: id,
        userId: req.user!.id,
        returnedAt: null,
      },
    });

    if (!borrowing) {
      throw new AppError('No active borrowing found', 404);
    }

    await prisma.$transaction([
      prisma.bookBorrowing.update({
        where: { id: borrowing.id },
        data: { returnedAt: new Date() },
      }),
      prisma.book.update({
        where: { id },
        data: { status: 'AVAILABLE' },
      }),
    ]);

    res.json({
      success: true,
      message: 'Book returned successfully',
    });
  } catch (error) {
    next(error);
  }
};
