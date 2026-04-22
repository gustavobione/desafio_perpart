import {
  Injectable, NotFoundException, ForbiddenException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Role } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Cria um novo produto (jogo de tabuleiro).
   * O ownerId vem do JWT (quem está logado).
   */
  async create(createProductDto: CreateProductDto, ownerId: string) {
    const { categoryIds, ...productData } = createProductDto;

    return this.prisma.product.create({
      data: {
        ...productData,
        owner: { connect: { id: ownerId } },
        // Conecta as categorias se foram informadas
        ...(categoryIds?.length && {
          categories: {
            connect: categoryIds.map((id) => ({ id })),
          },
        }),
      },
      include: {
        categories: true,
        owner: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  /**
   * Lista todos os produtos com paginação e filtros avançados.
   * Busca por título/descrição, categoria, status, faixa de preço.
   */
  async findAll(query: QueryProductDto) {
    const { search, categoryId, status, minPrice, maxPrice, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (categoryId) {
      where.categories = { some: { id: categoryId } };
    }

    if (status) {
      where.status = status;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.pricePerDay = {};
      if (minPrice !== undefined) where.pricePerDay.gte = minPrice;
      if (maxPrice !== undefined) where.pricePerDay.lte = maxPrice;
    }

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          categories: true,
          owner: {
            select: { id: true, name: true },
          },
          _count: {
            select: { favoritedBy: true, loans: true },
          },
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data: products,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Busca um produto por ID com todos os relacionamentos.
   */
  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        categories: true,
        owner: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
        _count: {
          select: { favoritedBy: true, loans: true },
        },
      },
    });

    if (!product) {
      throw new NotFoundException(`Produto com ID "${id}" não encontrado`);
    }

    return product;
  }

  /**
   * Atualiza um produto.
   * Apenas o dono ou ADMIN podem alterar.
   */
  async update(id: string, updateProductDto: UpdateProductDto, userId: string, userRole: Role) {
    const product = await this.findOne(id);

    // Verifica permissão: apenas o dono ou ADMIN
    if (product.owner.id !== userId && userRole !== Role.ADMIN) {
      throw new ForbiddenException('Você não tem permissão para editar este produto');
    }

    const { categoryIds, ...productData } = updateProductDto;

    return this.prisma.product.update({
      where: { id },
      data: {
        ...productData,
        // Se categoryIds foi informado, desconecta todas e reconecta as novas
        ...(categoryIds !== undefined && {
          categories: {
            set: [], // Remove todas as categorias atuais
            connect: categoryIds.map((catId) => ({ id: catId })),
          },
        }),
      },
      include: {
        categories: true,
        owner: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  /**
   * Remove um produto. Apenas o dono ou ADMIN.
   */
  async remove(id: string, userId: string, userRole: Role) {
    const product = await this.findOne(id);

    if (product.owner.id !== userId && userRole !== Role.ADMIN) {
      throw new ForbiddenException('Você não tem permissão para remover este produto');
    }

    await this.prisma.product.delete({ where: { id } });

    return { message: `Produto "${product.title}" removido com sucesso` };
  }

  /**
   * Adiciona um produto aos favoritos do usuário.
   */
  async favorite(productId: string, userId: string) {
    // Verifica se o produto existe
    await this.findOne(productId);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        favoriteProducts: {
          connect: { id: productId },
        },
      },
    });

    return { message: 'Produto adicionado aos favoritos' };
  }

  /**
   * Remove um produto dos favoritos do usuário.
   */
  async unfavorite(productId: string, userId: string) {
    await this.findOne(productId);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        favoriteProducts: {
          disconnect: { id: productId },
        },
      },
    });

    return { message: 'Produto removido dos favoritos' };
  }

  /**
   * Lista os produtos favoritos de um usuário.
   */
  async getFavorites(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where: {
          favoritedBy: { some: { id: userId } },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          categories: true,
          owner: { select: { id: true, name: true } },
        },
      }),
      this.prisma.product.count({
        where: {
          favoritedBy: { some: { id: userId } },
        },
      }),
    ]);

    return {
      data: products,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }
}
