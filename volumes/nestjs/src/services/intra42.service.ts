import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { AxiosResponse } from 'axios';

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

  getToken(
    code: string,
    redirect_uri: string,
  ): Observable<AxiosResponse<TokenResponse, any>> {
    return this.httpService.post('https://api.intra.42.fr/oauth/token', {
      grant_type: 'authorization_code',
      client_id: process.env.INTRA42_UID,
      client_secret: process.env.INTRA42_SECRET,
      code: code,
      redirect_uri: redirect_uri,
    });
  }

  getData(
    token: string,
    endpoint: string,
  ): Observable<AxiosResponse<any, any>> {
    return this.httpService.get('https://api.intra.42.fr' + endpoint, {
      headers: {
        Authorization: 'Bearer ' + token,
      },
    });
  }
}
