import { Router } from 'express';
import {
  createOrder,
  listMyOrders,
  listAllOrders,
  updateOrderStatus,
} from '../controllers/order.controller';
import { authMiddleware, adminOnly } from '../middleware/auth.middleware';

const router = Router();

router.post('/', authMiddleware, createOrder);
router.get('/me', authMiddleware, listMyOrders);
router.get('/', authMiddleware, adminOnly, listAllOrders);
router.patch('/:id/status', authMiddleware, adminOnly, updateOrderStatus);

export default router;
