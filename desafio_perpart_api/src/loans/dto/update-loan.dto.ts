import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsDateString } from 'class-validator';
import { LoanStatus } from '@prisma/client';

export class UpdateLoanDto {
  @ApiPropertyOptional({
    example: 'ACTIVE',
    description: 'Novo status do empréstimo',
    enum: LoanStatus,
  })
  @IsOptional()
  @IsEnum(LoanStatus)
  status?: LoanStatus;

  @ApiPropertyOptional({
    example: '2026-05-15T00:00:00.000Z',
    description: 'Data real de devolução',
  })
  @IsOptional()
  @IsDateString()
  actualReturnDate?: string;
}
