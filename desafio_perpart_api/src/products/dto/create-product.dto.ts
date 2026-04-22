import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsArray,
  IsUUID,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @ApiProperty({
    example: 'The Witcher: Old World',
    description: 'Título do jogo de tabuleiro',
  })
  @IsString()
  title: string;

  @ApiPropertyOptional({
    example:
      'Um jogo de RPG cooperativo ambientado no universo de The Witcher.',
    description: 'Descrição do jogo',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: 25.5,
    description: 'Preço por dia de aluguel (R$)',
  })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  pricePerDay: number;

  @ApiPropertyOptional({
    example: ['uuid-categoria-1', 'uuid-categoria-2'],
    description: 'IDs (UUIDs) das categorias do jogo',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  categoryIds?: string[];
}
