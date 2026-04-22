import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({
    example: 'Estratégia',
    description: 'Nome da categoria (único)',
  })
  @IsString()
  @MinLength(2)
  name: string;
}
