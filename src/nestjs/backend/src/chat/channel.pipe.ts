import {
  IsBoolean,
  IsString,
  IsStrongPassword,
  MinLength,
} from 'class-validator';

export class MessageDto {
  @IsString()
  @MinLength(10)
  content: string;

  @IsString()
  @MinLength(1)
  channelName: string;
}

export class ChannelDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsBoolean()
  isProtected: boolean;

  @IsBoolean()
  isPublic: boolean;

  @IsStrongPassword()
  password: string;
}

export class MembershipDto {
  @IsString()
  @MinLength(1)
  channelName: string;

  @IsString()
  @MinLength(1)
  login: string;
}
