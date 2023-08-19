import { IsString, MinLength } from 'class-validator';

export class MessageDto {
  @IsString()
  @MinLength(1)
  content: string;

  @IsString()
  @MinLength(1)
  channelName: string;
}

export class ChannelDto {
  @IsString()
  @MinLength(1)
  name: string;
}
