import { PartialType } from '@nestjs/swagger';
import { CreateProductDto } from './create-product.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum } from 'class-validator';
import { ProductStatus } from '@prisma/client';

/**
 * DTO para atualização de produto.
 * Herda todos os campos opcionais do CreateProductDto via PartialType.
 * Adiciona o campo status que só pode ser alterado na atualização.
 */
export class UpdateProductDto extends PartialType(CreateProductDto) {
  @ApiPropertyOptional({
    example: 'AVAILABLE',
    description: 'Status do produto',
    enum: ProductStatus,
  })
  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;
}
