import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private auditService: AuditService,
  ) {}

  /**
   * Valida as credenciais do usuário no fluxo de login (LocalStrategy).
   * Compara a senha fornecida com o hash armazenado no banco usando bcrypt.
   */
  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  /**
   * Gera o token JWT após a validação bem-sucedida do usuário.
   * O payload contém o ID, email e role do usuário.
   */
  async login(user: any) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    
    // Log do evento de LOGIN
    this.auditService.log({
      userId: user.id,
      action: 'LOGIN',
      entity: 'USER',
      entityId: user.id,
    }).catch(err => console.error('Erro ao salvar log de login:', err));

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  /**
   * Registra um novo usuário público (sempre com role USER).
   * A rota POST /auth/register é pública e qualquer pessoa pode se cadastrar.
   */
  async register(data: { name: string; email: string; password: string }) {
    // Verifica se o email já está em uso
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ConflictException('Este email já está em uso');
    }

    const saltOrRounds = 10;
    const hashedPassword = await bcrypt.hash(data.password, saltOrRounds);

    const user = await this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: Role.USER, // Registro público sempre cria USER
      },
    });

    const { password, ...result } = user;

    // Retorna o usuário criado + token JWT para login automático
    const payload = { email: result.email, sub: result.id, role: result.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: result,
    };
  }
}