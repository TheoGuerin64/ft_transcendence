export interface TokenResponse {
  access_token: string;
  refresh_token: string;
}

export interface JwtPayload {
  login: string;
}

export interface SignInResponse {
  encryptedLogin: string;
  twofa: boolean;
  firstTime: boolean;
}
