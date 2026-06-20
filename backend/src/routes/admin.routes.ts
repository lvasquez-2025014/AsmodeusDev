import { Router, Response } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { AuthRequest } from '../middleware/auth.middleware';
import { UserModel, UserRole } from '../models/user.model';

const router = Router();

router.get('/stats', authenticate, authorize('admin'), async (_req: AuthRequest, res: Response) => {
  const totalUsers = await UserModel.countDocuments();
  const admins = await UserModel.countDocuments({ role: UserRole.ADMIN });
  const vendedores = await UserModel.countDocuments({ role: UserRole.VENDEDOR });
  const clientes = await UserModel.countDocuments({ role: UserRole.CLIENTE });

  res.json({
    success: true,
    data: { totalUsers, admins, vendedores, clientes },
  });
});

router.get('/users', authenticate, authorize('admin'), async (_req: AuthRequest, res: Response) => {
  const users = await UserModel.find().select('-password').sort({ createdAt: -1 });
  res.json({ success: true, data: users });
});

router.put('/users/:id/role', authenticate, authorize('admin'), async (req: AuthRequest, res: Response) => {
  const { role } = req.body;

  if (!Object.values(UserRole).includes(role)) {
    res.status(400).json({ message: 'Rol inválido' });
    return;
  }

  const user = await UserModel.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
  if (!user) {
    res.status(404).json({ message: 'Usuario no encontrado' });
    return;
  }

  res.json({ success: true, data: user });
});

router.delete('/users/:id', authenticate, authorize('admin'), async (req: AuthRequest, res: Response) => {
  const user = await UserModel.findByIdAndDelete(req.params.id);
  if (!user) {
    res.status(404).json({ message: 'Usuario no encontrado' });
    return;
  }
  res.json({ success: true, message: 'Usuario eliminado' });
});

export default router;
