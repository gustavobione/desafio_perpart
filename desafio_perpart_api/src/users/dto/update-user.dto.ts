import { PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

/**
 * DTO para atualização de usuário.
 * Herda todos os campos do CreateUserDto como opcionais via PartialType.
 * Não redefinimos os campos aqui — o PartialType já faz isso automaticamente.
 */
export class UpdateUserDto extends PartialType(CreateUserDto) {}
