import { Router, Response } from 'express';
import { authenticate, authorize, AuthRequest } from '../middleware/auth.middleware';
import { OrderModel, OrderStatus } from '../models/order.model';
import { ProductModel } from '../models/product.model';

const router = Router();

// Create order (authenticated user)
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { productId, planDuration, amount, method } = req.body;

    if (!productId || !planDuration || !amount || !method) {
      res.status(400).json({ message: 'Datos incompletos' });
      return;
    }

    const product = await ProductModel.findById(productId);
    if (!product) {
      res.status(404).json({ message: 'Producto no encontrado' });
      return;
    }

    const plan = product.prices.find(p => p.duration === planDuration);
    if (!plan) {
      res.status(400).json({ message: 'Plan no válido' });
      return;
    }

    const order = await OrderModel.create({
      product: product._id,
      buyer: req.userId as any,
      buyerName: (req as any).user?.name || '',
      buyerEmail: (req as any).user?.email || '',
      planDuration,
      amount: plan.price,
      method,
      status: OrderStatus.PENDING,
    });

    await ProductModel.findByIdAndUpdate(productId, { $inc: { sales: 1 } });

    res.status(201).json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ message: 'Error al crear orden' });
  }
});

// Admin: list all orders
router.get('/', authenticate, authorize('admin'), async (_req: AuthRequest, res: Response) => {
  try {
    const orders = await OrderModel.find()
      .populate('product', 'name category')
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();
    res.json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener órdenes' });
  }
});

// Admin: earnings data for charts
router.get('/earnings', authenticate, authorize('admin'), async (_req: AuthRequest, res: Response) => {
  try {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Weekly data (last 7 days)
    const weeklyOrders = await OrderModel.find({
      createdAt: { $gte: weekAgo },
      status: { $ne: OrderStatus.CANCELLED },
    }).lean();

    const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const weeklyData: { label: string; amount: number }[] = [];

    for (let i = 6; i >= 0; i--) {
      const day = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dayStr = dayNames[day.getDay()];
      const dayStart = new Date(day.getFullYear(), day.getMonth(), day.getDate());
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

      const dayTotal = weeklyOrders
        .filter(o => {
          const created = new Date(o.createdAt!);
          return created >= dayStart && created < dayEnd;
        })
        .reduce((sum, o) => sum + (o.amount || 0), 0);

      weeklyData.push({ label: dayStr, amount: Math.round(dayTotal * 100) / 100 });
    }

    // Monthly totals
    const monthlyOrders = await OrderModel.find({
      createdAt: { $gte: monthAgo },
      status: { $ne: OrderStatus.CANCELLED },
    }).lean();

    const totalRevenue = monthlyOrders.reduce((sum, o) => sum + (o.amount || 0), 0);
    const totalOrders = monthlyOrders.length;

    // Recent transactions (last 10)
    const recentOrders = await OrderModel.find()
      .populate('product', 'name')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    const transactions = recentOrders.map(o => ({
      description: `${(o.product as any)?.name || 'Producto'} - ${o.planDuration}`,
      amount: o.amount,
      method: o.method,
      status: o.status,
      date: new Date(o.createdAt!).toLocaleDateString('es-ES'),
      icon: o.status === OrderStatus.COMPLETED ? 'fas fa-check-circle' : o.status === OrderStatus.CANCELLED ? 'fas fa-times-circle' : 'fas fa-clock',
      color: o.status === OrderStatus.COMPLETED ? 'green' : o.status === OrderStatus.CANCELLED ? 'red' : 'cyan',
      type: 'income',
    }));

    res.json({
      success: true,
      data: {
        weekly: weeklyData,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalOrders,
        transactions,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener datos de ganancias' });
  }
});

// Admin: update order status
router.put('/:id/status', authenticate, authorize('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body;
    if (!Object.values(OrderStatus).includes(status)) {
      res.status(400).json({ message: 'Estado inválido' });
      return;
    }

    const order = await OrderModel.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('product', 'name');

    if (!order) {
      res.status(404).json({ message: 'Orden no encontrada' });
      return;
    }

    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ message: 'Error al actualizar orden' });
  }
});

export default router;
