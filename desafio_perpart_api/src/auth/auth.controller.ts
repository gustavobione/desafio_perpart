import { Controller, Request, Post, UseGuards, Body } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { ValidatedUser } from '../types';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * Login com email e senha.
   * O Guard LocalStrategy valida as credenciais e injeta o user no request.
   */
  @ApiOperation({ summary: 'Login com email e senha' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Login realizado com sucesso. Retorna o token JWT.',
  })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas.' })
  @UseGuards(AuthGuard('local'))
  @Post('login')
  login(@Request() req: { user: ValidatedUser }) {
    return this.authService.login(req.user);
  }

  /**
   * Registro público de novo usuário (sempre com role USER).
   * Não requer autenticação.
   */
  @ApiOperation({ summary: 'Registrar novo usuário (público)' })
  @ApiResponse({
    status: 201,
    description: 'Usuário criado com sucesso. Retorna token JWT.',
  })
  @ApiResponse({ status: 409, description: 'Email já está em uso.' })
  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }
}
