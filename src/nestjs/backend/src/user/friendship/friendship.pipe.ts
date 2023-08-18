import { Length } from 'class-validator';

export class LoginDto {
  @Length(1, 8, { message: 'Login must be between 1 and 8 characters' })
  login: string;
}
