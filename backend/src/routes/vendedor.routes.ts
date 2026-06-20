import { Router, Response } from 'express';
import { authenticate, authorize, AuthRequest } from '../middleware/auth.middleware';

const router = Router();

router.get('/products', authenticate, authorize('admin', 'vendedor'), async (req: AuthRequest, res: Response) => {
  res.json({
    success: true,
    data: [],
    message: 'Productos del vendedor - pendiente de implementar',
  });
});

router.post('/products', authenticate, authorize('admin', 'vendedor'), async (req: AuthRequest, res: Response) => {
  res.json({
    success: true,
    message: 'Producto creado - pendiente de implementar',
  });
});

router.get('/sales', authenticate, authorize('admin', 'vendedor'), async (req: AuthRequest, res: Response) => {
  res.json({
    success: true,
    data: [],
    message: 'Ventas del vendedor - pendiente de implementar',
  });
});

export default router;
