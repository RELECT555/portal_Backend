import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';

// Расширяем Request для добавления user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name: string;
      };
    }
  }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Authentication required', 401);
    }

    const token = authHeader.substring(7);

    // TODO: Implement Azure AD token validation
    // Временно для разработки - пропускаем любой токен
    if (process.env.NODE_ENV === 'development') {
      req.user = {
        id: 'dev-user-id',
        email: 'dev@medipal.ru',
        name: 'Dev User',
      };
      return next();
    }

    // В production здесь будет валидация токена через Azure AD
    throw new AppError('Token validation not implemented', 501);
  } catch (error) {
    next(error);
  }
};
