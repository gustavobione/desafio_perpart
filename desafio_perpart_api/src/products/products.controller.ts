import {
  Controller, Get, Post, Body, Patch, Param, Delete,
  UseGuards, Query,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.auth-guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import {
  ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiParam, ApiQuery,
} from '@nestjs/swagger';

@ApiTags('Products')
@ApiBearerAuth('access-token')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  /**
   * Cria um novo produto (jogo de tabuleiro).
   * O dono é automaticamente o usuário logado.
   */
  @ApiOperation({ summary: 'Cadastrar novo jogo de tabuleiro' })
  @ApiResponse({ status: 201, description: 'Produto criado com sucesso.' })
  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Body() createProductDto: CreateProductDto,
    @CurrentUser('userId') userId: string,
  ) {
    return this.productsService.create(createProductDto, userId);
  }

  /**
   * Lista todos os produtos com filtros avançados e paginação.
   */
  @ApiOperation({ summary: 'Listar jogos com filtros e paginação' })
  @ApiResponse({ status: 200, description: 'Lista de produtos retornada.' })
  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Query() query: QueryProductDto) {
    return this.productsService.findAll(query);
  }

  /**
   * Lista os produtos favoritos do usuário autenticado.
   */
  @ApiOperation({ summary: 'Listar meus jogos favoritos' })
  @ApiResponse({ status: 200, description: 'Lista de favoritos retornada.' })
  @UseGuards(JwtAuthGuard)
  @Get('favorites')
  getFavorites(
    @CurrentUser('userId') userId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.productsService.getFavorites(userId, page, limit);
  }

  /**
   * Busca um produto por ID.
   */
  @ApiOperation({ summary: 'Buscar jogo por ID' })
  @ApiParam({ name: 'id', description: 'UUID do produto' })
  @ApiResponse({ status: 200, description: 'Produto encontrado.' })
  @ApiResponse({ status: 404, description: 'Produto não encontrado.' })
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  /**
   * Atualiza um produto. Apenas o dono ou ADMIN.
   */
  @ApiOperation({ summary: 'Atualizar jogo por ID' })
  @ApiParam({ name: 'id', description: 'UUID do produto' })
  @ApiResponse({ status: 200, description: 'Produto atualizado.' })
  @ApiResponse({ status: 403, description: 'Sem permissão.' })
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @CurrentUser() user: any,
  ) {
    return this.productsService.update(id, updateProductDto, user.userId, user.role);
  }

  /**
   * Remove um produto. Apenas o dono ou ADMIN.
   */
  @ApiOperation({ summary: 'Remover jogo por ID' })
  @ApiParam({ name: 'id', description: 'UUID do produto' })
  @ApiResponse({ status: 200, description: 'Produto removido.' })
  @ApiResponse({ status: 403, description: 'Sem permissão.' })
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.productsService.remove(id, user.userId, user.role);
  }

  /**
   * Favoritar um jogo.
   */
  @ApiOperation({ summary: 'Favoritar um jogo' })
  @ApiParam({ name: 'id', description: 'UUID do produto' })
  @ApiResponse({ status: 200, description: 'Produto favoritado.' })
  @UseGuards(JwtAuthGuard)
  @Post(':id/favorite')
  favorite(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.productsService.favorite(id, userId);
  }

  /**
   * Desfavoritar um jogo.
   */
  @ApiOperation({ summary: 'Desfavoritar um jogo' })
  @ApiParam({ name: 'id', description: 'UUID do produto' })
  @ApiResponse({ status: 200, description: 'Produto desfavoritado.' })
  @UseGuards(JwtAuthGuard)
  @Delete(':id/favorite')
  unfavorite(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.productsService.unfavorite(id, userId);
  }
}
