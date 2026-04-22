import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsEnum, IsOptional } from 'class-validator';
import { Role } from '@prisma/client';

export class CreateUserDto {
  @ApiProperty({ example: 'Gustavo Bione', description: 'Nome completo do usuário' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'gustavo@email.com', description: 'Email do usuário (único)' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '123456', description: 'Senha do usuário (mínimo 6 caracteres)' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({
    example: 'ADMIN',
    description: 'Role do usuário. Apenas ADMIN pode definir este campo.',
    enum: Role,
    required: false,
    default: 'USER',
  })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}
