import { ApiProperty } from '@nestjs/swagger';
import { AuditLog as PrismaAuditLog } from '@prisma/client';
import { Prisma } from '@prisma/client';

export class AuditLog implements PrismaAuditLog {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: 'CREATE' })
  action: string;

  @ApiProperty({ example: 'LOAN' })
  entity: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
    nullable: true,
  })
  entityId: string | null;

  @ApiProperty({
    example: { productId: 'abc', totalPrice: 45.0 },
    required: false,
    nullable: true,
  })
  details: Prisma.JsonValue | null;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  userId: string;

  @ApiProperty()
  createdAt: Date;
}
