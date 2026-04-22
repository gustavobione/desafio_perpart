import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { Notification } from '@prisma/client';

/**
 * WebSocket Gateway para notificações em tempo real.
 *
 * O frontend conecta via Socket.IO e envia um evento 'join'
 * com o userId para entrar na sala pessoal de notificações.
 *
 * Quando uma notificação é criada, o serviço chama
 * gateway.sendNotification(userId, notification) para emitir em tempo real.
 */
@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/notifications',
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private logger = new Logger('NotificationsGateway');

  handleConnection(client: Socket) {
    this.logger.log(`Cliente conectado: ${client.id}`);

    // O client envia o userId ao conectar para entrar na sala pessoal
    client.on('join', (userId: string) => {
      void client.join(`user_${userId}`);
      this.logger.log(`Usuário ${userId} entrou na sala de notificações`);
    });
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Cliente desconectado: ${client.id}`);
  }

  /**
   * Envia uma notificação para um usuário específico via WebSocket.
   * Chamado pelo NotificationsService ou outros services.
   */
  sendNotification(userId: string, notification: Notification) {
    this.server.to(`user_${userId}`).emit('notification', notification);
  }
}
