import { Router, Response } from 'express';
import { authenticate, authorize, AuthRequest } from '../middleware/auth.middleware';
import { ProductModel } from '../models/product.model';

const router = Router();

// Public: get all active products
router.get('/', async (_req, res: Response) => {
  const products = await ProductModel.find({ isActive: true }).sort({ createdAt: -1 });
  res.json({ success: true, data: products });
});

// Admin/Vendor: get all products (including inactive)
router.get('/all', authenticate, authorize('admin', 'vendedor'), async (_req: AuthRequest, res: Response) => {
  const products = await ProductModel.find().sort({ createdAt: -1 });
  res.json({ success: true, data: products });
});

// Admin only: create product
router.post('/', authenticate, authorize('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, category, prices, stock, badge, badgeType, icon } = req.body;

    if (!name || !description || !category) {
      res.status(400).json({ message: 'Nombre, descripción y categoría son requeridos' });
      return;
    }

    const product = await ProductModel.create({
      name,
      description,
      category,
      prices: prices || [],
      stock: stock ?? 999,
      badge: badge || '',
      badgeType: badgeType || 'info',
      icon: icon || 'fas fa-box',
    });

    res.status(201).json({ success: true, data: product });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error al crear producto' });
  }
});

// Admin/Vendor: update product
router.put('/:id', authenticate, authorize('admin', 'vendedor'), async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, category, prices, stock, isActive, badge, badgeType, icon } = req.body;
    const update: any = {};

    if (name !== undefined) update.name = name;
    if (description !== undefined) update.description = description;
    if (category !== undefined) update.category = category;
    if (prices !== undefined) update.prices = prices;
    if (stock !== undefined) update.stock = stock;
    if (isActive !== undefined) update.isActive = isActive;
    if (badge !== undefined) update.badge = badge;
    if (badgeType !== undefined) update.badgeType = badgeType;
    if (icon !== undefined) update.icon = icon;

    const product = await ProductModel.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!product) {
      res.status(404).json({ message: 'Producto no encontrado' });
      return;
    }

    res.json({ success: true, data: product });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error al actualizar producto' });
  }
});

// Admin only: delete product
router.delete('/:id', authenticate, authorize('admin'), async (req: AuthRequest, res: Response) => {
  const product = await ProductModel.findByIdAndDelete(req.params.id);
  if (!product) {
    res.status(404).json({ message: 'Producto no encontrado' });
    return;
  }
  res.json({ success: true, message: 'Producto eliminado' });
});

export default router;
