import { IsOptional, Length } from 'class-validator';

export class UserDto {
  @IsOptional()
  @Length(3, 16, { message: 'Name must be between 3 and 16 characters' })
  name: string;
}

export class LoginDto {
  @Length(1, 8, { message: 'Login must be between 1 and 8 characters' })
  login: string;
}
