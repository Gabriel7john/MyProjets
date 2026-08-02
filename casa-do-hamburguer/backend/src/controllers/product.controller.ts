import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';

const productSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(2),
  price: z.number().positive(),
  image: z.string().min(1),
  category: z.string().min(2),
  available: z.boolean().optional(),
});

export async function listProducts(req: Request, res: Response) {
  const { category } = req.query;

  const products = await prisma.product.findMany({
    where: category ? { category: String(category) } : undefined,
    orderBy: { category: 'asc' },
  });

  return res.json({ products });
}

export async function getProduct(req: Request, res: Response) {
  const product = await prisma.product.findUnique({ where: { id: req.params.id } });

  if (!product) {
    return res.status(404).json({ message: 'Produto não encontrado' });
  }

  return res.json({ product });
}

export async function createProduct(req: Request, res: Response) {
  const data = productSchema.parse(req.body);
  const product = await prisma.product.create({ data });
  return res.status(201).json({ product });
}

export async function updateProduct(req: Request, res: Response) {
  const data = productSchema.partial().parse(req.body);
  const product = await prisma.product.update({
    where: { id: req.params.id },
    data,
  });
  return res.json({ product });
}

export async function deleteProduct(req: Request, res: Response) {
  await prisma.product.delete({ where: { id: req.params.id } });
  return res.status(204).send();
}
