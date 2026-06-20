import { Request, Response, NextFunction } from 'express';

export function validateRegister(req: Request, res: Response, next: NextFunction): void {
  const { name, email, password } = req.body;
  const errors: string[] = [];

  if (!name || name.trim().length < 2) errors.push('Nombre debe tener al menos 2 caracteres');
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('Email inválido');
  if (!password || password.length < 6) errors.push('Contraseña debe tener al menos 6 caracteres');

  if (errors.length) {
    res.status(400).json({ message: errors.join('. ') });
    return;
  }

  next();
}

export function validateLogin(req: Request, res: Response, next: NextFunction): void {
  const { email, password } = req.body;
  const errors: string[] = [];

  if (!email) errors.push('Email o usuario requerido');
  if (!password) errors.push('Contraseña requerida');

  if (errors.length) {
    res.status(400).json({ message: errors.join('. ') });
    return;
  }

  next();
}
