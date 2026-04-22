import { ApiProperty } from '@nestjs/swagger';
import { Product as PrismaProduct, ProductStatus } from '@prisma/client';

export class Product implements PrismaProduct {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: 'Catan' })
  title: string;

  @ApiProperty({
    example: 'Jogo clássico de negociação e estratégia.',
    required: false,
    nullable: true,
  })
  description: string | null;

  @ApiProperty({
    example: 'https://exemplo.com/catan.jpg',
    required: false,
    nullable: true,
  })
  imageUrl: string | null;

  @ApiProperty({ example: 15.5 })
  pricePerDay: number;

  @ApiProperty({ enum: ProductStatus, example: ProductStatus.AVAILABLE })
  status: ProductStatus;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  ownerId: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
