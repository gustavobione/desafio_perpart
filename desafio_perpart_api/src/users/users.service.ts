import {
  Injectable,
  NotFoundException,
  ConflictException,
  OnModuleInit,
  Logger,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';

@Injectable()
export class UsersService implements OnModuleInit {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    this.logger.log('Checando necessidade de seed do Admin inicial...');
    const adminName =
      process.env.INITIAL_ADMIN_USER ||
      process.env.INITIAL_ADMIN_NAME ||
      process.env.INITIAL_ADMIN_USERNAME ||
      'Super Admin';
    const adminEmail = process.env.INITIAL_ADMIN_EMAIL;
    const adminPassword = process.env.INITIAL_ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      this.logger.warn('Credenciais de ADMIN inicial não fornecidas no .env.');
      return;
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (existingUser) {
      if (existingUser.role !== 'ADMIN' && existingUser.email === adminEmail) {
        this.logger.log(
          `Usuário ${adminEmail} já existe. Atualizando para ADMIN...`,
        );
        await this.prisma.user.update({
          where: { email: adminEmail },
          data: { role: 'ADMIN' },
        });
        this.logger.log('Usuário atualizado para ADMIN com sucesso!');
      } else {
        this.logger.log('Usuário inicial já é um ADMIN. Seed ignorado.');
      }
    } else {
      this.logger.log(
        `Nenhum usuário encontrado com ${adminEmail}. Criando admin...`,
      );
      const saltOrRounds = 10;
      const hashedPassword = await bcrypt.hash(adminPassword, saltOrRounds);

      await this.prisma.user.create({
        data: {
          name: adminName,
          email: adminEmail,
          password: hashedPassword,
          role: 'ADMIN',
        },
      });
      this.logger.log('ADMIN inicial criado com sucesso!');
    }
  }

  /**
   * Cria um novo usuário (rota exclusiva do ADMIN).
   * Faz hash da senha e verifica unicidade do email.
   */
  async create(createUserDto: CreateUserDto) {
    // Verifica se o email já está em uso
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Este email já está em uso');
    }

    const saltOrRounds = 10;
    const hashedPassword = await bcrypt.hash(
      createUserDto.password,
      saltOrRounds,
    );

    const user = await this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
      },
    });

    // Nunca retorna a senha no response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user;
    return result;
  }

  /**
   * Lista todos os usuários com paginação e filtros.
   * Suporta busca por nome/email e filtro por role.
   */
  async findAll(query: QueryUserDto) {
    const { search, role, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    // Monta filtros dinâmicos
    const where: Prisma.UserWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role) {
      where.role = role;
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          avatarUrl: true,
          createdAt: true,
          updatedAt: true,
          // Não retorna a senha
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Busca um usuário por ID (UUID).
   * Lança NotFoundException se não encontrar.
   */
  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            products: true,
            categories: true,
            favoriteProducts: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`Usuário com ID "${id}" não encontrado`);
    }

    return user;
  }

  /**
   * Atualiza um usuário.
   * Se a senha for alterada, faz o hash novamente.
   */
  async update(id: string, updateUserDto: UpdateUserDto) {
    // Verifica se o usuário existe
    await this.findOne(id);

    const data: Prisma.UserUpdateInput = { ...updateUserDto };

    // Se estiver atualizando a senha, faz hash
    if (updateUserDto.password) {
      const saltOrRounds = 10;
      data.password = await bcrypt.hash(updateUserDto.password, saltOrRounds);
    }

    // Se estiver atualizando o email, verifica unicidade
    if (updateUserDto.email) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: updateUserDto.email },
      });
      if (existingUser && existingUser.id !== id) {
        throw new ConflictException(
          'Este email já está em uso por outro usuário',
        );
      }
    }

    const user = await this.prisma.user.update({
      where: { id },
      data,
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user;
    return result;
  }

  /**
   * Remove um usuário por ID.
   */
  async remove(id: string) {
    // Verifica se o usuário existe
    await this.findOne(id);

    await this.prisma.user.delete({ where: { id } });

    return { message: `Usuário com ID "${id}" removido com sucesso` };
  }
}
