import { AuthService } from './auth.service';
import { JwtAuthGuard } from './auth-jwt.guard';
import { OAuth2AuthGuard } from './auth-oauth2.guard';
import {
  Controller,
  Get,
  InternalServerErrorException,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';

const COOKIES_OPTIONS = {
  httpOnly: true,
  sameSite: 'Strict',
  maxAge: 2592000000,
};

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('authorize')
  getAuthorize(@Res() res: any): void {
    res.redirect(
      'https://api.intra.42.fr/oauth/authorize?client_id=' +
        process.env.INTRA42_UID +
        '&redirect_uri=' +
        process.env.INTRA42_REDIRECT_URI +
        '&response_type=code',
    );
  }

  @UseGuards(OAuth2AuthGuard)
  @Get('sign-in')
  async signIn(
    @Req() req: any,
    @Res({ passthrough: true }) res: any,
  ): Promise<string> {
    if (!req.user) {
      throw new InternalServerErrorException();
    }
    const token = await this.authService.signIn(req.user);
    res.cookie('token', token, COOKIES_OPTIONS);
    return token;
  }

  @UseGuards(JwtAuthGuard)
  @Get('sign-out')
  async signOut(@Res({ passthrough: true }) res: any): Promise<void> {
    res.clearCookie('token', COOKIES_OPTIONS);
  }
}
