import {
  Injectable, NotFoundException, ConflictException,
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { QueryCategoryDto } from './dto/query-category.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Cria uma nova categoria.
   * O creatorId vem do JWT (quem está logado).
   */
  async create(createCategoryDto: CreateCategoryDto, creatorId: string) {
    // Verifica se já existe uma categoria com esse nome
    const existing = await this.prisma.category.findUnique({
      where: { name: createCategoryDto.name },
    });

    if (existing) {
      throw new ConflictException(`Categoria "${createCategoryDto.name}" já existe`);
    }

    return this.prisma.category.create({
      data: {
        name: createCategoryDto.name,
        creator: { connect: { id: creatorId } },
      },
      include: {
        creator: { select: { id: true, name: true } },
        _count: { select: { products: true } },
      },
    });
  }

  /**
   * Lista todas as categorias com paginação e busca.
   */
  async findAll(query: QueryCategoryDto) {
    const { search, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.CategoryWhereInput = {};

    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    const [categories, total] = await Promise.all([
      this.prisma.category.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        include: {
          creator: { select: { id: true, name: true } },
          _count: { select: { products: true } },
        },
      }),
      this.prisma.category.count({ where }),
    ]);

    return {
      data: categories,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Busca uma categoria por ID.
   */
  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        creator: { select: { id: true, name: true } },
        products: {
          select: {
            id: true,
            title: true,
            imageUrl: true,
            pricePerDay: true,
            status: true,
          },
        },
        _count: { select: { products: true } },
      },
    });

    if (!category) {
      throw new NotFoundException(`Categoria com ID "${id}" não encontrada`);
    }

    return category;
  }

  /**
   * Atualiza uma categoria.
   */
  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    await this.findOne(id);

    // Se estiver alterando o nome, verifica unicidade
    if (updateCategoryDto.name) {
      const existing = await this.prisma.category.findUnique({
        where: { name: updateCategoryDto.name },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException(`Categoria "${updateCategoryDto.name}" já existe`);
      }
    }

    return this.prisma.category.update({
      where: { id },
      data: updateCategoryDto,
      include: {
        creator: { select: { id: true, name: true } },
        _count: { select: { products: true } },
      },
    });
  }

  /**
   * Remove uma categoria.
   */
  async remove(id: string) {
    const category = await this.findOne(id);

    await this.prisma.category.delete({ where: { id } });

    return { message: `Categoria "${category.name}" removida com sucesso` };
  }
}
