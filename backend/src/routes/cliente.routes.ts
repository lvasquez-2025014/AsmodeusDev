import { Router, Response } from 'express';
import { authenticate, authorize, AuthRequest } from '../middleware/auth.middleware';

const router = Router();

router.get('/orders', authenticate, authorize('admin', 'vendedor', 'cliente'), async (req: AuthRequest, res: Response) => {
  res.json({
    success: true,
    data: [],
    message: 'Órdenes del cliente - pendiente de implementar',
  });
});

router.get('/purchases', authenticate, authorize('admin', 'vendedor', 'cliente'), async (req: AuthRequest, res: Response) => {
  res.json({
    success: true,
    data: [],
    message: 'Compras del cliente - pendiente de implementar',
  });
});

export default router;
