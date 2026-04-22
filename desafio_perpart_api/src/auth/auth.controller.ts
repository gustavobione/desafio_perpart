import { Controller, Request, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // Este Guard chama automaticamente o LocalStrategy antes de rodar o método login
  @UseGuards(AuthGuard('local')) 
  @Post('login')
  async login(@Request() req) {
    // req.user foi injetado pelo LocalStrategy
    return this.authService.login(req.user);
  }
}