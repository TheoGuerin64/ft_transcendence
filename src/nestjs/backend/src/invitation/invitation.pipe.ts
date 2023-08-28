import { IsInt, IsOptional, IsPositive, Length } from 'class-validator';

export class SendInvitationDto {
  @Length(1, 8, { message: 'Login must be between 1 and 8 characters' })
  login: string;

  @Length(1, 20, { message: 'Socket ID must be between 1 and 20 characters' })
  socket_id: string;

  @IsOptional()
  @Length(1, 20, { message: 'Channel must be between 1 and 20 characters' })
  channel: string;
}

export class AcceptInvitationDto {
  @IsInt()
  @IsPositive()
  id: number;

  @Length(1, 20, { message: 'Socket ID must be between 1 and 20 characters' })
  socket_id: string;
}

export class RefuseInvitationDto {
  @IsInt()
  @IsPositive()
  id: number;
}
