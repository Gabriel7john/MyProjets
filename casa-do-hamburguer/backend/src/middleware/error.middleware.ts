import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      message: 'Dados inválidos',
      errors: err.flatten().fieldErrors,
    });
  }

  console.error(err);
  return res.status(500).json({ message: 'Erro interno do servidor' });
}
