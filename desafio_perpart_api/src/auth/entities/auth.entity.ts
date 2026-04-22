import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';

export class AuthResponse {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Token JWT de acesso',
  })
  access_token: string;

  @ApiProperty({
    description: 'Dados do usuário autenticado',
    type: () => User,
  })
  user: User;
}
