import { firstValueFrom } from 'rxjs';
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
  created_at: number;
  secret_valid_until: number;
}

@Injectable()
export class Intra42Service {
  constructor(private readonly httpService: HttpService) {}

  async getToken(code: string): Promise<TokenResponse | null> {
    const data = {
      grant_type: 'authorization_code',
      client_id: process.env.INTRA42_UID,
      client_secret: process.env.INTRA42_SECRET,
      code: code,
      redirect_uri: process.env.INTRA42_REDIRECT_URI,
    };
    const request = this.httpService.post(
      'https://api.intra.42.fr/oauth/token',
      data,
    );
    return (await firstValueFrom(request)).data;
  }

  async getData(token: string, endpoint: string): Promise<any> {
    const config = {
      headers: {
        Authorization: 'Bearer ' + token,
      },
    };
    const request = this.httpService.get(
      'https://api.intra.42.fr' + endpoint,
      config,
    );
    return (await firstValueFrom(request)).data;
  }

  getAuthorizeUrl(): string {
    return (
      'https://api.intra.42.fr/oauth/authorize?client_id=' +
      process.env.INTRA42_UID +
      '&redirect_uri=' +
      process.env.INTRA42_REDIRECT_URI +
      '&response_type=code'
    );
  }
}
