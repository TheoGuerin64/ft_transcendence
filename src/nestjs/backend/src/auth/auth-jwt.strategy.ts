import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from './auth.types';

/**
 * Strategy to validate JWT tokens from headers or cookies
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        JwtStrategy.extractJWT,
        JwtStrategy.extractJWTFromSocketAuth,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  /**
   * Validate JWT payload
   */
  async validate(payload: JwtPayload) {
    return { login: payload.login };
  }

  /**
   * Extract JWT from cookies
   */
  static extractJWT(req: Request): string | null {
    if (req.cookies && 'token' in req.cookies && req.cookies.token.length > 0) {
      return req.cookies.token;
    }
    return null;
  }

  /**
   * Extract JWT from socket.io auth handshake
   */
  static extractJWTFromSocketAuth(req: any): string | null {
    const token = req.handshake.auth.token as string | null;
    if (!token || token.length == 0) {
      return null;
    }
    return token;
  }
}
