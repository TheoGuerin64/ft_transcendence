import { authenticator } from 'otplib';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './auth-jwt.guard';
import { VerifyDto } from './auth.pipe';
import { OAuth2AuthGuard } from './auth-oauth2.guard';
import { SignInResponse } from './auth.types';
import { toDataURL } from 'qrcode';
import { UserService } from '../user/user.service';
import {
  BadRequestException,
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

const COOKIES_OPTIONS = {
  httpOnly: false,
  sameSite: 'Lax',
  maxAge: 2592000000,
};

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  /**
   * Redirect to 42 OAuth2 authorization page
   */
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

  /**
   * Sign in user with 42 OAuth2 tokens
   * @returns Encrypted login and 2FA status (true if 2FA is enabled)
   */
  @UseGuards(OAuth2AuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Get('sign-in')
  async getSignIn(@Req() req: any): Promise<SignInResponse> {
    const user = await this.userService.findOne(req.user.login);
    const firstTime = user.firstTime;
    if (firstTime) {
      user.firstTime = false;
      await this.userService.save(user);
    }

    return {
      encryptedLogin: await this.authService.encrypt(req.user.login),
      twofa: req.user.twofaSecret !== null,
      firstTime: firstTime,
    };
  }

  /**
   * Verify user login and 2FA token
   * @param encryptedLogin Encrypted base64 login
   * @param twofaToken 2FA token
   * @returns JWT token cookie
   */
  @Post('verify')
  async postVerify(
    @Body() verifyDto: VerifyDto,
    @Res({ passthrough: true }) res: any,
  ): Promise<string> {
    // Get user from encrypted login
    const login = await this.authService.decrypt(verifyDto.encrypted_login);
    const user = await this.userService.findOne(login);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // verify 2FA token
    if (
      user.twofaSecret &&
      (!verifyDto.twofa_token ||
        !authenticator.verify({
          token: verifyDto.twofa_token,
          secret: user.twofaSecret,
        }))
    ) {
      throw new UnauthorizedException('2FA token is invalid');
    } else if (!user.twofaSecret && verifyDto.twofa_token) {
      throw new BadRequestException('2FA is not enabled');
    }

    // Create JWT token and set it as cookie
    const token = await this.authService.jwtSignIn(user);
    res.cookie('token', token, COOKIES_OPTIONS);
    return token;
  }

  /**
   * Sign in user with fake user
   * @returns JWT token cookie
   */
  @Get('fake')
  async getFake(@Res({ passthrough: true }) res: any): Promise<string> {
    const user = await this.userService.findOne('fake');
    const token = await this.authService.jwtSignIn(user);
    res.cookie('token', token, COOKIES_OPTIONS);
    return token;
  }

  /**
   * Sign out user by clearing JWT token cookie
   */
  @UseGuards(JwtAuthGuard)
  @Get('sign-out')
  async getSignOut(@Res({ passthrough: true }) res: any): Promise<void> {
    res.clearCookie('token', COOKIES_OPTIONS);
  }

  /**
   * Enable 2FA for user
   * @returns Base64 QR code image
   */
  @UseGuards(JwtAuthGuard)
  @Post('2fa/enable')
  async post2faEnable(@Req() req: any): Promise<string> {
    const user = await this.userService.findOne(req.user.login);
    if (user.twofaSecret) {
      throw new BadRequestException('2FA is already enabled');
    }

    // Generate 2FA secret and QR code
    const secret = authenticator.generateSecret();
    const otpauthUrl = authenticator.keyuri(
      user.login,
      'FT_TRANSCENDENCE',
      secret,
    );
    const qr = await toDataURL(otpauthUrl);

    user.twofaSecret = secret;
    await this.userService.save(user);
    return qr;
  }

  /**
   * Disable 2FA for user
   */
  @UseGuards(JwtAuthGuard)
  @Post('2fa/delete')
  async post2faDelete(@Req() req: any): Promise<void> {
    const user = await this.userService.findOne(req.user.login);
    if (!user.twofaSecret) {
      throw new BadRequestException('2FA is not enabled');
    }
    user.twofaSecret = null;
    await this.userService.save(user);
  }
}
