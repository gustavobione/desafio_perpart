import { Category as PrismaCategory } from '@prisma/client';

/**
 * Classe para representar uma categoria (DTO de saída).
 * Estende o modelo do Prisma.
 */
export class Category implements PrismaCategory {
  id: string;
  name: string;
  creatorId: string;
  createdAt: Date;
  updatedAt: Date;
}
