import { PartialType } from '@nestjs/swagger';
import { CreateCategoryDto } from './create-category.dto';

/**
 * DTO para atualização de categoria.
 * Herda todos os campos opcionais do CreateCategoryDto via PartialType.
 */
export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}
