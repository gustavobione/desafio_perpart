import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { QueryCategoryDto } from './dto/query-category.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.auth-guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('Categories')
@ApiBearerAuth('access-token')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  /**
   * Cria uma nova categoria de jogo.
   * O criador é automaticamente o usuário logado.
   */
  @ApiOperation({ summary: 'Criar nova categoria' })
  @ApiResponse({ status: 201, description: 'Categoria criada com sucesso.' })
  @ApiResponse({
    status: 409,
    description: 'Categoria com este nome já existe.',
  })
  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Body() createCategoryDto: CreateCategoryDto,
    @CurrentUser('userId') userId: string,
  ) {
    return this.categoriesService.create(createCategoryDto, userId);
  }

  /**
   * Lista todas as categorias com filtros e paginação.
   */
  @ApiOperation({ summary: 'Listar categorias com filtros e paginação' })
  @ApiResponse({
    status: 200,
    description: 'Lista de categorias retornada.',
  })
  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Query() query: QueryCategoryDto) {
    return this.categoriesService.findAll(query);
  }

  /**
   * Busca uma categoria por ID com os produtos associados.
   */
  @ApiOperation({ summary: 'Buscar categoria por ID' })
  @ApiParam({ name: 'id', description: 'UUID da categoria' })
  @ApiResponse({ status: 200, description: 'Categoria encontrada.' })
  @ApiResponse({ status: 404, description: 'Categoria não encontrada.' })
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(id);
  }

  /**
   * Atualiza uma categoria.
   */
  @ApiOperation({ summary: 'Atualizar categoria por ID' })
  @ApiParam({ name: 'id', description: 'UUID da categoria' })
  @ApiResponse({ status: 200, description: 'Categoria atualizada.' })
  @ApiResponse({
    status: 409,
    description: 'Nome de categoria já existe.',
  })
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  /**
   * Remove uma categoria.
   */
  @ApiOperation({ summary: 'Remover categoria por ID' })
  @ApiParam({ name: 'id', description: 'UUID da categoria' })
  @ApiResponse({ status: 200, description: 'Categoria removida.' })
  @ApiResponse({ status: 404, description: 'Categoria não encontrada.' })
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.categoriesService.remove(id);
  }
}
