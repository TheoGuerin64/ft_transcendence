import {
  Controller,
  Get,
  Redirect,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';

export interface Redirection {
  url?: string;
  statusCode?: number;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly jwtService: JwtService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('test')
  getTest(@Request() req): void {
    return req.user;
  }

  @UseGuards(AuthGuard('oauth2'))
  @Get('login')
  @Redirect('http://127.0.0.1:8080/')
  getLogin(@Request() req, @Res() res: Response): void {
    const a = this.jwtService.sign({ login: req.user.login });
    console.log(a);
  }
}
