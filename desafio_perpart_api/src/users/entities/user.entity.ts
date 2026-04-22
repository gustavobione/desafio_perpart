import { ApiProperty } from '@nestjs/swagger';
import { User as PrismaUser, Role } from '@prisma/client';

export class User implements Omit<PrismaUser, 'password'> {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: 'João da Silva' })
  name: string;

  @ApiProperty({ example: 'joao@email.com' })
  email: string;

  @ApiProperty({ enum: Role, example: Role.USER })
  role: Role;

  @ApiProperty({
    example: 'https://exemplo.com/avatar.jpg',
    required: false,
    nullable: true,
  })
  avatarUrl: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
