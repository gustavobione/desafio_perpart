import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationType } from '@prisma/client';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Cria uma nova notificação para um usuário.
   * Retorna a notificação criada (usada pelo WebSocket gateway para emitir).
   */
  async create(data: {
    userId: string;
    content: string;
    type: NotificationType;
  }) {
    return this.prisma.notification.create({
      data: {
        userId: data.userId,
        content: data.content,
        type: data.type,
      },
    });
  }

  /**
   * Lista as notificações de um usuário com paginação.
   */
  async findAllByUser(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [notifications, total, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.notification.count({ where: { userId } }),
      this.prisma.notification.count({
        where: { userId, read: false },
      }),
    ]);

    return {
      data: notifications,
      unreadCount,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Marca uma notificação como lida.
   */
  async markAsRead(notificationId: string, userId: string) {
    await this.prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { read: true },
    });

    return { message: 'Notificação marcada como lida' };
  }

  /**
   * Marca todas as notificações de um usuário como lidas.
   */
  async markAllAsRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });

    return { message: 'Todas as notificações foram marcadas como lidas' };
  }
}
