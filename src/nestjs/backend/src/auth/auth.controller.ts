import { authenticator } from 'otplib';
import { toDataURL } from 'qrcode';
import { User } from 'src/user/user.entity';
import { UserService } from '../user/user.service';
import { JwtAuthGuard } from './auth-jwt.guard';
import { OAuth2AuthGuard } from './auth-oauth2.guard';
import { LengthDto, VerifyDto } from './auth.pipe';
import { AuthService } from './auth.service';
import { SignInResponse } from './auth.types';
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
    return {
      encryptedLogin: await this.authService.encrypt(req.user.login),
      twofa: req.user.twofaSecret !== null,
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

    this.userService.update(user, { twofaSecret: secret });
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
    this.userService.update(user, { twofaSecret: null });
  }

  /**
   * Add random fake user to database
   * @returns user
   */
  @Get('fake')
  async getFake(@Body() lengthDto: LengthDto): Promise<User[]> {
    const users = [];
    for (let i = 0; i < lengthDto.length; i++) {
      users.push(await this.authService.addFakeUser());
    }
    return users;
  }
}
