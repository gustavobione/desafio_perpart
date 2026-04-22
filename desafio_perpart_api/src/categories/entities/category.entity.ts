import { ApiProperty } from '@nestjs/swagger';
import { Category as PrismaCategory } from '@prisma/client';

export class Category implements PrismaCategory {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: 'Estratégia' })
  name: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  creatorId: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
