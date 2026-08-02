import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  userId?: string;
  userRole?: 'CUSTOMER' | 'ADMIN';
}

interface TokenPayload {
  sub: string;
  role: 'CUSTOMER' | 'ADMIN';
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: 'Token não fornecido' });
  }

  const [, token] = authHeader.split(' ');

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET as string) as TokenPayload;
    req.userId = payload.sub;
    req.userRole = payload.role;
    return next();
  } catch {
    return res.status(401).json({ message: 'Token inválido ou expirado' });
  }
}

export function adminOnly(req: AuthRequest, res: Response, next: NextFunction) {
  if (req.userRole !== 'ADMIN') {
    return res.status(403).json({ message: 'Acesso restrito a administradores' });
  }
  return next();
}
