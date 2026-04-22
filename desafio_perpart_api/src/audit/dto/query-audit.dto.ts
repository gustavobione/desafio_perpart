import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Min, Max, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryAuditDto {
  @ApiPropertyOptional({ description: 'Filtrar por UUID do usuário' })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({ example: 'CREATE', description: 'Filtrar por ação (CREATE, UPDATE, DELETE, LOGIN, FAVORITE)' })
  @IsOptional()
  @IsString()
  action?: string;

  @ApiPropertyOptional({ example: 'PRODUCT', description: 'Filtrar por entidade (USER, PRODUCT, CATEGORY, LOAN)' })
  @IsOptional()
  @IsString()
  entity?: string;

  @ApiPropertyOptional({ example: '2026-01-01', description: 'Data inicial do filtro (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2026-12-31', description: 'Data final do filtro (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 20, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
