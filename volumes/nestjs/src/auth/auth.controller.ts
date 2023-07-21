import { AxiosError } from 'axios';
import { Response } from 'express';
import { Controller, Get, Query, Redirect, Res } from '@nestjs/common';
import { Intra42Service } from '../intra42/intra42.service';
import { AuthService } from './auth.service';

export interface Redirection {
  url?: string;
  statusCode?: number;
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly intra42Service: Intra42Service,
  ) {}

  @Get('login')
  @Redirect('http://127.0.0.1:8080/')
  async getAuth(
    @Query('code') code: string | undefined,
    @Res() res: Response,
  ): Promise<Redirection | void> {
    if (!code) {
      return { url: this.intra42Service.getAuthorizeUrl() };
    }
    try {
      const cookie = await this.authService.connect(code);
      res.cookie('token', cookie, {
        httpOnly: true,
        secure: false,
        maxAge: 7200000,
        domain: '127.0.0.1',
        sameSite: 'none',
      });
    } catch (e) {
      if (e instanceof AxiosError) {
        return { url: 'http://127.0.0.1:8080/error?code=' + e.response.status };
      } else {
        throw e;
      }
    }
  }

  @Get('logout')
  @Redirect('http://127.0.0.1:8080/')
  logout(@Res() res: Response): void {
    res.clearCookie('token');
  }
}
