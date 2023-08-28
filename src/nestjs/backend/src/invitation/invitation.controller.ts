import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/auth-jwt.guard';
import { Invitation } from './invitation.entity';
import { InvitationService } from './invitation.service';
import {
  AcceptInvitationDto,
  RefuseInvitationDto,
  SendInvitationDto,
} from './invitation.pipe';
import { ChannelService } from 'src/chat/channel.service';
import { MembershipService } from 'src/chat/membership.service';

@Controller('invitation')
export class InvitationController {
  constructor(
    private readonly invitationService: InvitationService,
    private readonly channelService: ChannelService,
    private readonly membershipService: MembershipService,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getInvitations(@Req() req: any): Promise<Invitation[]> {
    return await this.invitationService.getInvitations(req.user.login);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async sendInvitation(
    @Req() req: any,
    @Body() sendInvitationDto: SendInvitationDto,
  ): Promise<void> {
    const invitation = await this.invitationService.findInvitation(
      req.user.login,
      sendInvitationDto.login,
      sendInvitationDto.channel,
    );
    if (invitation !== null) {
      throw new BadRequestException('Invitation already sent');
    }

    if (sendInvitationDto.channel !== null) {
      const channel = await this.channelService.findOne(
        sendInvitationDto.channel,
      );
      if (channel === null) {
        throw new BadRequestException('Channel does not exist');
      }
      if (channel.isProtected || channel.isPublic) {
        throw new BadRequestException('Channel is not private');
      }

      const membership = await this.membershipService.findOne(
        sendInvitationDto.channel,
        req.user.login,
      );
      if (membership === null) {
        throw new BadRequestException('You are not a member of this channel');
      } else if (membership.role !== 'owner') {
        throw new BadRequestException('You are not the owner of this channel');
      }
    }

    await this.invitationService.sendInvitation({
      requester_login: req.user.login,
      requester_socket_id: sendInvitationDto.socket_id,
      requested_login: sendInvitationDto.login,
      channel_id: sendInvitationDto.channel,
    });
  }

  @Post('accept')
  @UseGuards(JwtAuthGuard)
  async acceptInvitation(
    @Req() req: any,
    @Body() acceptInvitationDto: AcceptInvitationDto,
  ): Promise<void> {
    const invitation = await this.invitationService.findInvitationById(
      acceptInvitationDto.id,
    );
    if (invitation.requester.login === req.user.login) {
      throw new BadRequestException('You are the requester');
    }

    await this.invitationService.acceptInvitation(
      invitation,
      acceptInvitationDto.socket_id,
    );
  }

  @Post('refuse')
  @UseGuards(JwtAuthGuard)
  async refuseInvitation(
    @Req() req: any,
    @Body() refuseInvitationDto: RefuseInvitationDto,
  ): Promise<void> {
    const invitation = await this.invitationService.findInvitationById(
      refuseInvitationDto.id,
    );
    if (invitation.requester.login === req.user.login) {
      throw new BadRequestException('You are the requester');
    }

    await this.invitationService.refuseInvitation(invitation);
  }
}
