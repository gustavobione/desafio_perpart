import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { AuditService } from './audit.service';
import { QueryAuditDto } from './dto/query-audit.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.auth-guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';

@ApiTags('Audit')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  /**
   * Lista todos os logs de auditoria com filtros.
   * Apenas ADMIN pode acessar.
   */
  @ApiOperation({ summary: 'Listar logs de auditoria (ADMIN only)' })
  @ApiResponse({ status: 200, description: 'Logs retornados com sucesso.' })
  @ApiResponse({ status: 403, description: 'Acesso negado. Apenas ADMIN.' })
  @Get()
  findAll(@Query() query: QueryAuditDto) {
    return this.auditService.findAll(query);
  }

  /**
   * Gera relatório de uso do sistema.
   * Apenas ADMIN pode acessar.
   */
  @ApiOperation({ summary: 'Relatório de uso do sistema (ADMIN only)' })
  @ApiResponse({ status: 200, description: 'Relatório gerado com sucesso.' })
  @Get('report')
  getReport(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.auditService.getReport(startDate, endDate);
  }
}
