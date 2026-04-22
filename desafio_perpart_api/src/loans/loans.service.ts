import {
  Injectable, NotFoundException, BadRequestException, ForbiddenException,
} from '@nestjs/common';
import { CreateLoanDto } from './dto/create-loan.dto';
import { UpdateLoanDto } from './dto/update-loan.dto';
import { QueryLoanDto } from './dto/query-loan.dto';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { AuditService } from '../audit/audit.service';
import { LoanStatus, ProductStatus, NotificationType, Prisma, Role } from '@prisma/client';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Logger } from '@nestjs/common';

@Injectable()
export class LoansService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    private notificationsGateway: NotificationsGateway,
    private auditService: AuditService,
  ) {}

  private readonly logger = new Logger(LoansService.name);

  /**
   * Solicita um empréstimo de um jogo.
   * Calcula o preço total automaticamente com base no pricePerDay.
   * Notifica o dono do jogo.
   */
  async create(createLoanDto: CreateLoanDto, renterId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: createLoanDto.productId },
      include: { owner: { select: { id: true, name: true } } },
    });

    if (!product) {
      throw new NotFoundException('Produto não encontrado');
    }

    if (product.status !== ProductStatus.AVAILABLE) {
      throw new BadRequestException('Este jogo não está disponível para aluguel');
    }

    if (product.ownerId === renterId) {
      throw new BadRequestException('Você não pode alugar seu próprio jogo');
    }

    // Calcula dias de aluguel e preço total
    const startDate = new Date();
    const expectedReturn = new Date(createLoanDto.expectedReturnDate);
    const days = Math.ceil(
      (expectedReturn.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (days <= 0) {
      throw new BadRequestException('A data de devolução deve ser no futuro');
    }

    const totalPrice = days * product.pricePerDay;

    const loan = await this.prisma.loan.create({
      data: {
        renterId,
        productId: product.id,
        expectedReturnDate: expectedReturn,
        totalPrice,
        status: LoanStatus.REQUESTED,
      },
      include: {
        product: { select: { id: true, title: true } },
        renter: { select: { id: true, name: true } },
      },
    });

    // Notifica o dono do jogo
    const notification = await this.notificationsService.create({
      userId: product.ownerId,
      content: `${loan.renter.name} solicitou o aluguel do jogo "${product.title}" por ${days} dias (R$ ${totalPrice.toFixed(2)})`,
      type: NotificationType.LOAN_REQUEST,
    });

    // Envia em tempo real via WebSocket
    this.notificationsGateway.sendNotification(product.ownerId, notification);

    // Registra no audit log
    await this.auditService.log({
      userId: renterId,
      action: 'CREATE',
      entity: 'LOAN',
      entityId: loan.id,
      details: { productId: product.id, totalPrice, days },
    });

    return loan;
  }

  /**
   * Lista empréstimos do usuário (como locatário) ou todos (ADMIN).
   */
  async findAll(query: QueryLoanDto, userId: string, userRole: Role) {
    const { status, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.LoanWhereInput = {};

    // ADMIN vê todos, USER vê apenas os seus
    if (userRole !== Role.ADMIN) {
      where.renterId = userId;
    }

    if (status) {
      where.status = status;
    }

    const [loans, total] = await Promise.all([
      this.prisma.loan.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          product: { select: { id: true, title: true, imageUrl: true, pricePerDay: true } },
          renter: { select: { id: true, name: true, email: true } },
        },
      }),
      this.prisma.loan.count({ where }),
    ]);

    return {
      data: loans,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  /**
   * Busca um empréstimo por ID.
   */
  async findOne(id: string) {
    const loan = await this.prisma.loan.findUnique({
      where: { id },
      include: {
        product: {
          select: { id: true, title: true, imageUrl: true, pricePerDay: true, ownerId: true },
        },
        renter: { select: { id: true, name: true, email: true } },
      },
    });

    if (!loan) {
      throw new NotFoundException(`Empréstimo com ID "${id}" não encontrado`);
    }

    return loan;
  }

  /**
   * Aprova um empréstimo (dono do jogo ou ADMIN).
   * Muda status para ACTIVE e produto para RENTED.
   */
  async approve(loanId: string, userId: string, userRole: Role) {
    const loan = await this.findOne(loanId);

    if (loan.status !== LoanStatus.REQUESTED) {
      throw new BadRequestException('Este empréstimo não está pendente de aprovação');
    }

    // Apenas o dono do produto ou ADMIN pode aprovar
    if (loan.product.ownerId !== userId && userRole !== Role.ADMIN) {
      throw new ForbiddenException('Apenas o dono do jogo ou ADMIN pode aprovar');
    }

    const updated = await this.prisma.loan.update({
      where: { id: loanId },
      data: { status: LoanStatus.ACTIVE },
      include: {
        product: { select: { id: true, title: true } },
        renter: { select: { id: true, name: true } },
      },
    });

    // Marca o produto como alugado
    await this.prisma.product.update({
      where: { id: loan.product.id },
      data: { status: ProductStatus.RENTED },
    });

    // Notifica o locatário
    const notification = await this.notificationsService.create({
      userId: loan.renter.id,
      content: `Seu pedido de aluguel do jogo "${loan.product.title}" foi aprovado!`,
      type: NotificationType.LOAN_APPROVED,
    });

    this.notificationsGateway.sendNotification(loan.renter.id, notification);

    await this.auditService.log({
      userId,
      action: 'UPDATE',
      entity: 'LOAN',
      entityId: loanId,
      details: { oldStatus: 'REQUESTED', newStatus: 'ACTIVE' },
    });

    return updated;
  }

  /**
   * Registra a devolução de um jogo.
   * Muda status do empréstimo para RETURNED e produto para AVAILABLE.
   */
  async returnGame(loanId: string, userId: string, userRole: Role) {
    const loan = await this.findOne(loanId);

    if (loan.status !== LoanStatus.ACTIVE && loan.status !== LoanStatus.OVERDUE) {
      throw new BadRequestException('Este empréstimo não está ativo');
    }

    // Apenas o locatário, dono do produto ou ADMIN pode devolver
    if (
      loan.renter.id !== userId &&
      loan.product.ownerId !== userId &&
      userRole !== Role.ADMIN
    ) {
      throw new ForbiddenException('Sem permissão para registrar esta devolução');
    }

    const updated = await this.prisma.loan.update({
      where: { id: loanId },
      data: {
        status: LoanStatus.RETURNED,
        actualReturnDate: new Date(),
      },
      include: {
        product: { select: { id: true, title: true } },
        renter: { select: { id: true, name: true } },
      },
    });

    // Produto volta a ficar disponível
    await this.prisma.product.update({
      where: { id: loan.product.id },
      data: { status: ProductStatus.AVAILABLE },
    });

    // Notifica o dono do produto sobre a devolução
    const notification = await this.notificationsService.create({
      userId: loan.product.ownerId,
      content: `O jogo "${loan.product.title}" foi devolvido por ${loan.renter.name}`,
      type: NotificationType.LOAN_RETURNED,
    });

    this.notificationsGateway.sendNotification(loan.product.ownerId, notification);

    await this.auditService.log({
      userId,
      action: 'UPDATE',
      entity: 'LOAN',
      entityId: loanId,
      details: { oldStatus: loan.status, newStatus: 'RETURNED' },
    });

    return updated;
  }

  /**
   * Cronjob diário para verificar empréstimos atrasados (OVERDUE).
   * Roda todos os dias à meia-noite.
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async checkOverdueLoans() {
    this.logger.log('Iniciando verificação de empréstimos atrasados...');

    const now = new Date();

    const overdueLoans = await this.prisma.loan.findMany({
      where: {
        status: LoanStatus.ACTIVE,
        expectedReturnDate: {
          lt: now, // se a data de retorno esperada for menor que agora
        },
      },
      include: {
        product: { select: { title: true, ownerId: true } },
        renter: { select: { id: true, name: true } },
      },
    });

    if (overdueLoans.length === 0) {
      this.logger.log('Nenhum empréstimo atrasado encontrado.');
      return;
    }

    // Atualiza todos para OVERDUE
    await this.prisma.loan.updateMany({
      where: {
        id: { in: overdueLoans.map((l) => l.id) },
      },
      data: {
        status: LoanStatus.OVERDUE,
      },
    });

    this.logger.log(`Atualizados ${overdueLoans.length} empréstimos para OVERDUE.`);

    // Envia notificações para o dono e para quem alugou
    for (const loan of overdueLoans) {
      // Para o locatário
      const renterNotification = await this.notificationsService.create({
        userId: loan.renter.id,
        content: `Atenção: A devolução do jogo "${loan.product.title}" está atrasada!`,
        type: NotificationType.SYSTEM,
      });
      this.notificationsGateway.sendNotification(loan.renter.id, renterNotification);

      // Para o dono
      const ownerNotification = await this.notificationsService.create({
        userId: loan.product.ownerId,
        content: `A devolução do seu jogo "${loan.product.title}" por ${loan.renter.name} está atrasada.`,
        type: NotificationType.SYSTEM,
      });
      this.notificationsGateway.sendNotification(loan.product.ownerId, ownerNotification);
    }
  }
}
