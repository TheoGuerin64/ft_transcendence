import { IsBase64, IsNumberString, IsOptional, Length } from 'class-validator';

export class VerifyDto {
  @IsBase64({ message: 'Login must be base64 encoded' })
  encrypted_login: string;

  @IsOptional()
  @IsNumberString(
    { no_symbols: true },
    { message: '2FA token must be a number' },
  )
  @Length(6, 6, { message: '2FA token must be 6 characters' })
  twofa_token?: string;
}

export class LengthDto {
  @IsNumberString()
  length: number;
}
