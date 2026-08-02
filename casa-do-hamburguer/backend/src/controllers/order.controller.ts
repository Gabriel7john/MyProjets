import { Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth.middleware';

const createOrderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        quantity: z.number().int().positive(),
      })
    )
    .min(1, 'O pedido precisa ter ao menos um item'),
});

export async function createOrder(req: AuthRequest, res: Response) {
  const { items } = createOrderSchema.parse(req.body);

  const productIds = items.map((item) => item.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
  });

  if (products.length !== productIds.length) {
    return res.status(400).json({ message: 'Um ou mais produtos não foram encontrados' });
  }

  const orderItemsData = items.map((item) => {
    const product = products.find((p) => p.id === item.productId)!;
    return {
      productId: product.id,
      quantity: item.quantity,
      unitPrice: product.price,
    };
  });

  const total = orderItemsData.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  const order = await prisma.order.create({
    data: {
      userId: req.userId as string,
      total,
      items: { create: orderItemsData },
    },
    include: { items: { include: { product: true } } },
  });

  return res.status(201).json({ order });
}

export async function listMyOrders(req: AuthRequest, res: Response) {
  const orders = await prisma.order.findMany({
    where: { userId: req.userId },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: 'desc' },
  });

  return res.json({ orders });
}

export async function listAllOrders(req: AuthRequest, res: Response) {
  const orders = await prisma.order.findMany({
    include: { items: { include: { product: true } }, user: { select: { name: true, email: true } } },
    orderBy: { createdAt: 'desc' },
  });

  return res.json({ orders });
}

export async function updateOrderStatus(req: AuthRequest, res: Response) {
  const statusSchema = z.object({
    status: z.enum(['PENDING', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED']),
  });
  const { status } = statusSchema.parse(req.body);

  const order = await prisma.order.update({
    where: { id: req.params.id },
    data: { status },
  });

  return res.json({ order });
}
