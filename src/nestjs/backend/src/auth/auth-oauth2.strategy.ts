import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-oauth2';
import { AuthService } from './auth.service';

/**
 * Strategy to validate OAuth2 tokens from 42 API
 */
@Injectable()
export class OAuth2Strategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      authorizationURL: 'https://api.intra.42.fr/oauth/authorize',
      tokenURL: 'https://api.intra.42.fr/oauth/token',
      clientID: process.env.INTRA42_UID,
      clientSecret: process.env.INTRA42_SECRET,
      callbackURL: process.env.INTRA42_REDIRECT_URI,
    });
  }

  /**
   * Validate OAuth2 tokens
   */
  async validate(
    access_token: string,
    refresh_token: string,
    profile: any,
    verify: VerifyCallback,
  ): Promise<any> {
    const user = await this.authService.register({
      access_token,
      refresh_token,
    });
    return verify(null, user);
  }
}
