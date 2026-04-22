import { ApiProperty } from '@nestjs/swagger';
import {
  Notification as PrismaNotification,
  NotificationType,
} from '@prisma/client';

export class Notification implements PrismaNotification {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: 'Seu pedido de empréstimo foi aprovado!' })
  content: string;

  @ApiProperty({ example: false })
  read: boolean;

  @ApiProperty({ enum: NotificationType, example: NotificationType.SYSTEM })
  type: NotificationType;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  userId: string;

  @ApiProperty()
  createdAt: Date;
}
