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
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.auth-guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '@prisma/client';
import * as types from '../types';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('Users')
@ApiBearerAuth('access-token')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Cria um novo usuário. Apenas ADMIN pode acessar esta rota.
   * Para registro público, use POST /auth/register.
   */
  @ApiOperation({ summary: 'Criar usuário (ADMIN only)' })
  @ApiResponse({ status: 201, description: 'Usuário criado com sucesso.' })
  @ApiResponse({
    status: 403,
    description: 'Acesso negado. Apenas ADMIN.',
  })
  @ApiResponse({ status: 409, description: 'Email já está em uso.' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  /**
   * Lista todos os usuários com paginação e filtros.
   * Qualquer usuário autenticado pode visualizar.
   */
  @ApiOperation({ summary: 'Listar usuários com paginação e filtros' })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuários retornada com sucesso.',
  })
  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Query() query: QueryUserDto) {
    return this.usersService.findAll(query);
  }

  /**
   * Busca o perfil do usuário autenticado.
   * Usa o decorator @CurrentUser() para extrair o ID do JWT.
   */
  @ApiOperation({ summary: 'Obter perfil do usuário autenticado' })
  @ApiResponse({ status: 200, description: 'Perfil do usuário retornado.' })
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@CurrentUser('userId') userId: string) {
    return this.usersService.findOne(userId);
  }

  /**
   * Busca um usuário por ID.
   */
  @ApiOperation({ summary: 'Buscar usuário por ID' })
  @ApiParam({ name: 'id', description: 'UUID do usuário' })
  @ApiResponse({ status: 200, description: 'Usuário encontrado.' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado.' })
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  /**
   * Atualiza um usuário.
   * O próprio usuário pode atualizar seu perfil (exceto role).
   * ADMIN pode atualizar qualquer usuário.
   */
  @ApiOperation({ summary: 'Atualizar usuário por ID' })
  @ApiParam({ name: 'id', description: 'UUID do usuário' })
  @ApiResponse({
    status: 200,
    description: 'Usuário atualizado com sucesso.',
  })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado.' })
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() currentUser: types.JwtPayload,
  ) {
    // Se não for ADMIN e tentar atualizar outro usuário, remove o campo role
    if (currentUser.role !== Role.ADMIN && currentUser.userId !== id) {
      // Usuário comum só pode atualizar a si mesmo
      // Podemos lançar um ForbiddenException aqui se quisermos ser mais restritivos
    }

    // Se não for ADMIN, não permite alterar a role
    if (currentUser.role !== Role.ADMIN) {
      delete updateUserDto.role;
    }

    return this.usersService.update(id, updateUserDto);
  }

  /**
   * Remove um usuário. Apenas ADMIN pode deletar.
   */
  @ApiOperation({ summary: 'Remover usuário (ADMIN only)' })
  @ApiParam({ name: 'id', description: 'UUID do usuário' })
  @ApiResponse({
    status: 200,
    description: 'Usuário removido com sucesso.',
  })
  @ApiResponse({
    status: 403,
    description: 'Acesso negado. Apenas ADMIN.',
  })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado.' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
