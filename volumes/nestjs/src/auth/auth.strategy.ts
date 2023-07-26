import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { AxiosError } from 'axios';
import { Strategy, VerifyCallback } from 'passport-oauth2';
import { UserService } from 'src/user/user.service';
import { AuthService } from './auth.service';

@Injectable()
export class AuthStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      authorizationURL: 'https://api.intra.42.fr/oauth/authorize',
      tokenURL: 'https://api.intra.42.fr/oauth/token',
      clientID: process.env.INTRA42_UID,
      clientSecret: process.env.INTRA42_SECRET,
      callbackURL: process.env.INTRA42_REDIRECT_URI,
    });
  }

  async validate(
    access_token: string,
    refresh_token: string,
    profile: any,
    verify: VerifyCallback,
  ): Promise<any> {
    try {
      const user = await this.authService.register({
        access_token,
        refresh_token,
      });
      return verify(null, user);
    } catch (e) {
      if (e instanceof AxiosError) {
        return verify(e, null);
      } else {
        throw e;
      }
    }
  }
}
