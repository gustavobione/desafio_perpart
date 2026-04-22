import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsDateString, IsUUID } from 'class-validator';

export class CreateLoanDto {
  @ApiProperty({ example: 'uuid-do-produto', description: 'UUID do jogo a ser alugado' })
  @IsUUID()
  productId: string;

  @ApiProperty({ example: '2026-05-01T00:00:00.000Z', description: 'Data prevista de devolução' })
  @IsDateString()
  expectedReturnDate: string;
}
