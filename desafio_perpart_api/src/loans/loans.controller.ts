import {
  Controller, Get, Post, Patch, Param, Body, UseGuards, Query,
} from '@nestjs/common';
import { LoansService } from './loans.service';
import { CreateLoanDto } from './dto/create-loan.dto';
import { QueryLoanDto } from './dto/query-loan.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.auth-guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import {
  ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiParam,
} from '@nestjs/swagger';

@ApiTags('Loans')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('loans')
export class LoansController {
  constructor(private readonly loansService: LoansService) {}

  /**
   * Solicita o aluguel de um jogo.
   */
  @ApiOperation({ summary: 'Solicitar aluguel de um jogo' })
  @ApiResponse({ status: 201, description: 'Solicitação criada. Aguardando aprovação do dono.' })
  @ApiResponse({ status: 400, description: 'Jogo indisponível ou data inválida.' })
  @Post()
  create(
    @Body() createLoanDto: CreateLoanDto,
    @CurrentUser('userId') userId: string,
  ) {
    return this.loansService.create(createLoanDto, userId);
  }

  /**
   * Lista empréstimos (USER vê os seus, ADMIN vê todos).
   */
  @ApiOperation({ summary: 'Listar empréstimos' })
  @ApiResponse({ status: 200, description: 'Lista de empréstimos retornada.' })
  @Get()
  findAll(@Query() query: QueryLoanDto, @CurrentUser() user: any) {
    return this.loansService.findAll(query, user.userId, user.role);
  }

  /**
   * Busca um empréstimo por ID.
   */
  @ApiOperation({ summary: 'Buscar empréstimo por ID' })
  @ApiParam({ name: 'id', description: 'UUID do empréstimo' })
  @ApiResponse({ status: 200, description: 'Empréstimo encontrado.' })
  @ApiResponse({ status: 404, description: 'Empréstimo não encontrado.' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.loansService.findOne(id);
  }

  /**
   * Aprova um empréstimo (dono do jogo ou ADMIN).
   */
  @ApiOperation({ summary: 'Aprovar empréstimo (dono do jogo ou ADMIN)' })
  @ApiParam({ name: 'id', description: 'UUID do empréstimo' })
  @ApiResponse({ status: 200, description: 'Empréstimo aprovado.' })
  @ApiResponse({ status: 403, description: 'Sem permissão.' })
  @Patch(':id/approve')
  approve(@Param('id') id: string, @CurrentUser() user: any) {
    return this.loansService.approve(id, user.userId, user.role);
  }

  /**
   * Registra a devolução de um jogo.
   */
  @ApiOperation({ summary: 'Devolver jogo alugado' })
  @ApiParam({ name: 'id', description: 'UUID do empréstimo' })
  @ApiResponse({ status: 200, description: 'Devolução registrada. Jogo disponível novamente.' })
  @Patch(':id/return')
  returnGame(@Param('id') id: string, @CurrentUser() user: any) {
    return this.loansService.returnGame(id, user.userId, user.role);
  }
}
