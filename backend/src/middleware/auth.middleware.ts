import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { UserModel } from '../models/user.model';

export interface AuthRequest extends Request {
  userId?: string;
  userRole?: string;
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;

  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Token requerido' });
    return;
  }

  try {
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, config.jwtSecret) as { id: string };
    req.userId = decoded.id;
    next();
  } catch {
    res.status(401).json({ message: 'Token inválido o expirado' });
  }
}

export function authorize(...roles: string[]) {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await UserModel.findById(req.userId).select('role');
      if (!user) {
        res.status(401).json({ message: 'Usuario no encontrado' });
        return;
      }

      if (!roles.includes(user.role as string)) {
        res.status(403).json({ message: 'No tienes permisos para acceder a este recurso' });
        return;
      }

      req.userRole = user.role as string;
      next();
    } catch {
      res.status(500).json({ message: 'Error del servidor' });
    }
  };
}
