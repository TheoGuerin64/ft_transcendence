import { createCipheriv, createDecipheriv, scrypt } from 'crypto';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { lastValueFrom } from 'rxjs';
import { promisify } from 'util';
import { TokenResponse } from './auth.types';
import { User } from '../user/user.entity';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly httpService: HttpService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Get data from 42 API
   * @param accessToken Access token
   * @param endpoint Endpoint to get data from
   * @returns Data from 42 API
   */
  async getData(accessToken: string, endpoint: string): Promise<object> {
    const config = {
      headers: {
        Authorization: 'Bearer ' + accessToken,
      },
    };
    const request = this.httpService.get(
      'https://api.intra.42.fr' + endpoint,
      config,
    );
    return (await lastValueFrom(request)).data;
  }

  /**
   * Register user from 42 API
   * @param token Tokens from 42 API
   * @returns User
   */
  async register(token: TokenResponse): Promise<User> {
    const data = await this.getData(token.access_token, '/v2/me');
    let user = await this.userService.findOne(data['login']);
    const newToken = {
      access_token: token.access_token,
      refresh_token: token.refresh_token,
    };
    if (!user) {
      user = await this.userService.create({
        login: data['login'],
        name: data['login'],
        avatar: data['image']['versions']['medium'],
        memberships: [],
        messages: [],
        ...newToken,
        matchPlayed: [],
      });
    }
    return user;
  }

  /**
   * Sign in user
   * @param user User to sign in
   * @returns JWT token
   */
  async jwtSignIn(user: User): Promise<string> {
    return this.jwtService.sign({ login: user.login });
  }

  /**
   * Encrypt data
   * @param data Data to encrypt
   * @returns Encrypted base64 data
   */
  async encrypt(data: string): Promise<string> {
    const key = (await promisify(scrypt)(
      process.env.TWOFA_PASSWORD,
      process.env.TWOFA_SALT,
      32,
    )) as Buffer;
    const cipher = createCipheriv('aes-256-ctr', key, '0000000000000000');
    const buffer = Buffer.concat([cipher.update(data), cipher.final()]);
    return buffer.toString('base64');
  }

  /**
   * Decrypt data
   * @param data Encrypted base64 data
   * @returns Decrypted data
   */
  async decrypt(data: string): Promise<string> {
    const key = (await promisify(scrypt)(
      process.env.TWOFA_PASSWORD,
      process.env.TWOFA_SALT,
      32,
    )) as Buffer;
    const decipher = createDecipheriv('aes-256-ctr', key, '0000000000000000');
    const buffer = Buffer.concat([
      decipher.update(data, 'base64'),
      decipher.final(),
    ]);
    return buffer.toString('utf-8');
  }

  /**
   * Validate JWT token
   * @param token JWT token
   * @returns User
   */
  async validateJwt(token: string): Promise<User> {
    const data = this.jwtService.verify(token);
    return this.userService.findOne(data['login']);
  }
}
