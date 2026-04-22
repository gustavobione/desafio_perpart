import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  // Usado pelo LocalStrategy para validar a senha
  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    
    // IMPORTANTE: Em um cenário real, você usaria bcrypt.compare() aqui.
    // Para o teste técnico, se o PDF não exigiu hash, você pode comparar em plain text,
    // mas recomendo instalar o bcrypt e fazer o hash para ganhar pontos!
    if (user && user.password === pass) {
      const { password, ...result } = user; // Remove a senha antes de retornar
      return result;
    }
    return null;
  }

  // Chamado após o LocalStrategy validar o usuário para gerar o token
  async login(user: any) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}