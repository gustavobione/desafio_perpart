import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { AuditLogData } from '../types';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  /**
   * Registra uma ação de auditoria no banco.
   * Chamado por outros services ou pelo interceptor.
   */
  async log(data: AuditLogData) {
    return this.prisma.auditLog.create({
      data: {
        userId: String(data.userId),
        action: data.action,
        entity: data.entity,
        entityId: data.entityId != null ? String(data.entityId) : undefined,
        details: (data.details as Prisma.InputJsonValue) ?? Prisma.JsonNull,
      },
    });
  }

  /**
   * Lista logs de auditoria com filtros avançados.
   * Apenas ADMIN pode acessar.
   */
  async findAll(query: {
    userId?: string;
    action?: string;
    entity?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) {
    const {
      userId,
      action,
      entity,
      startDate,
      endDate,
      page = 1,
      limit = 20,
    } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.AuditLogWhereInput = {};

    if (userId) where.userId = userId;
    if (action) where.action = action;
    if (entity) where.entity = entity;

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      data: logs,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Gera relatório de uso do sistema.
   * Agregações por ação, entidade e período.
   */
  async getReport(startDate?: string, endDate?: string) {
    const where: Prisma.AuditLogWhereInput = {};

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const [
      totalLogs,
      totalUsers,
      totalProducts,
      totalCategories,
      totalLoans,
      actionCounts,
    ] = await Promise.all([
      this.prisma.auditLog.count({ where }),
      this.prisma.user.count(),
      this.prisma.product.count(),
      this.prisma.category.count(),
      this.prisma.loan.count(),
      this.prisma.auditLog.groupBy({
        by: ['action'],
        _count: { action: true },
        where,
      }),
    ]);

    return {
      overview: {
        totalLogs,
        totalUsers,
        totalProducts,
        totalCategories,
        totalLoans,
      },
      actionBreakdown: actionCounts.map((item) => ({
        action: item.action,
        count: item._count.action,
      })),
      period: {
        from: startDate || 'início',
        to: endDate || 'agora',
      },
    };
  }
}
